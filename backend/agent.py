from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import llm, AgentServer, AgentSession, Agent, room_io
from livekit.plugins import (
    google,
    noise_cancellation,
    silero,
)
import os 
import asyncio
import logging
from api import AssistantFnc

load_dotenv(".env.local")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("food-court-agent")
logger.setLevel(logging.DEBUG)

# 🍽️ Food Court Assistant Instructions
INSTRUCTIONS = (
    "You are the manager of a food court. "
    "Greet customers, take their name and food order, "
    "generate a bill with a unique ID and total amount, "
    "and confirm the order details. "
    "Speak in a mix of Tamil and English (90% Tamil, 10% English). "
    "Be polite and helpful. If the customer speaks English, respond in English, "
    "but otherwise prioritize Tamil."
)

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=INSTRUCTIONS)

# 🎙️ Start the Agent Server
server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    logger.info("Initializing agent for room: %s", ctx.room.name)
    
    # Initialize assistant logic
    fnc_ctx = AssistantFnc(ctx.room)
    
    # Setup session with multimodal model
    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            voice="Puck",
            api_key=os.getenv("GOOGLE_API_KEY"),
        ),
        vad=silero.VAD.load(),
        tools=llm.find_function_tools(fnc_ctx),
        allow_interruptions=True,
    )

    @session.on("user_speech_finished")
    def on_user_speech_finished(event: llm.UserSpeechFinishedEvent):
        logger.info("User speech finished: %s", event.text)

    @session.on("agent_speech_started")
    def on_agent_speech_started(event: llm.AgentSpeechStartedEvent):
        logger.info("Agent started speaking")

    @session.on("error")
    def on_error(event: llm.ErrorEvent):
        logger.error("Agent session error: %s", event.error)

    await session.start(
        room=ctx.room,
        agent=Assistant(),
    )

    logger.info("Agent session started in room: %s", ctx.room.name)

    # 🗣️ Initial greeting in Tamil
    await session.generate_reply(
        instructions="Vanakkam! Welcome to our food court. Simple-ah unga order-a sollunga."
    )

    shutdown_evt = asyncio.Event()

    @ctx.room.on("disconnected")
    def on_disconnected():
        logger.info("Room disconnected")
        shutdown_evt.set()

    await shutdown_evt.wait()

if __name__ == "__main__":
    agents.cli.run_app(server)
