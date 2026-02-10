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
from api import AssistantFnc

load_dotenv(".env.local")

# 🍽️ Food Court Assistant Instructions (90% Tamil, 10% English)
class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=(
                "You are the manager of a food court. "
                "Greet customers, take their name and food order, "
                "generate a bill with a unique ID and total amount, "
                "and confirm the order details. "
                "Speak in a mix of Tamil and English (90% Tamil, 10% English). "
                "Be polite and helpful. If the customer speaks English, respond in English, "
                "but otherwise prioritize Tamil."
            )
        )

# 🎙️ Start the Agent Server
server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    # Setup session with playground-like parameters
    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            voice="Puck",
            api_key=os.getenv("GOOGLE_API_KEY"),
        ),
        vad=silero.VAD.load(),
        tools=llm.find_function_tools(AssistantFnc(ctx.room)),
        allow_interruptions=True,
        min_interruption_duration=0.3,
        min_endpointing_delay=0.5,
        max_endpointing_delay=1.5,
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony()
                if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                else noise_cancellation.BVC(),
            ),
        ),
    )

    # 🗣️ Initial greeting in Tamil
    await session.generate_reply(
        instructions="Vanakkam! Welcome to our food court. Ungal peyar enna? Ungalukku enna venum order panna?"
    )

    # ♾️ Keep the session alive until the room disconnects or an error occurs
    shutdown_evt = asyncio.Event()

    @session.on("close")
    def on_close(event):
        shutdown_evt.set()

    @ctx.room.on("disconnected")
    def on_disconnected():
        shutdown_evt.set()

    await shutdown_evt.wait()

if __name__ == "__main__":
    agents.cli.run_app(server)