from __future__ import annotations
# change

import os
import asyncio
import logging

from livekit.agents import llm, AgentSession, Agent, JobContext
import importlib

# `server` may not be exported in some versions of the livekit.agents package.
# Import it lazily and provide a no-op decorator fallback so the module can be
# imported in environments where the server helper is not available.
_agents_mod = importlib.import_module("livekit.agents")
server = getattr(_agents_mod, "server", None)
if server and hasattr(server, "rtc_session"):
    rtc_session_decorator = server.rtc_session
else:
    def rtc_session_decorator(*args, **kwargs):
        def _noop(fn):
            return fn
        return _noop
from livekit.plugins import google, silero

try:
    from backend.api import AssistantFnc
except Exception:
    # Support running the module as a script or from tests where package
    # imports may not be set up; fall back to a local import.
    from api import AssistantFnc

logger = logging.getLogger("food-court-agent")


class Assistant(Agent):
    """Minimal Assistant agent implementation used to start sessions."""
    def __init__(self, *, instructions: str = "You are a helpful food-court assistant."):
        super().__init__(instructions=instructions)


@rtc_session_decorator()
async def my_agent(ctx: JobContext):
    logger.info("Initializing agent for room: %s", ctx.room.name)

    fnc_ctx = AssistantFnc(ctx.room)

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
    def on_user_speech_finished(event):
        # avoid evaluating llm.* annotations at define-time (they may not exist)
        logger.info("User speech finished: %s", getattr(event, "text", ""))
        session.conversation.item.create(
            llm.ChatMessage(role="user", content=getattr(event, "text", ""))
        )
        session.response.create()

    @session.on("agent_speech_started")
    def on_agent_speech_started(event):
        logger.info("Agent started speaking")

    @session.on("error")
    def on_error(event):
        logger.error("Agent session error: %s", getattr(event, "error", event))

    await session.start(
        room=ctx.room,
        agent=Assistant(),
    )

    logger.info("Agent session started in room: %s", ctx.room.name)

    # 🗣️ Initial greeting in Tamil
    session.conversation.item.create(
        llm.ChatMessage(role="assistant", content="வணக்கம்! நான் உங்கள் உணவக உதவியாளர். உங்கள் பெயர் என்ன?")
    )
    session.response.create()

    shutdown_evt = asyncio.Event()

    @ctx.room.on("disconnected")
    def on_disconnected():
        logger.info("Room disconnected")
        shutdown_evt.set()

    await shutdown_evt.wait()