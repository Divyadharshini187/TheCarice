import logging
import os
from dotenv import load_dotenv

from sarvam_tts import SarvamTTS
from sarvam_stt import SarvamSTT

from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    RoomInputOptions,
    function_tool,
)
from livekit.agents.voice import AgentSession
from livekit.agents import Agent
from livekit.plugins import groq, silero

load_dotenv(".env.local")

logger = logging.getLogger("food-court-agent")
logging.basicConfig(level=logging.INFO)

VAD_MODEL = silero.VAD.load()


# =========================
# LANGUAGE DETECTION
# =========================

def detect_language(chat_msg) -> str:
    try:
        content = ""

        if hasattr(chat_msg, "content"):
            if isinstance(chat_msg.content, str):
                content = chat_msg.content
            elif isinstance(chat_msg.content, list):
                content = " ".join(
                    part.text for part in chat_msg.content
                    if hasattr(part, "text")
                )

        if not content:
            return "ta"

        english_chars = sum(c.isascii() and c.isalpha() for c in content)
        tamil_chars = sum("\u0b80" <= c <= "\u0bff" for c in content)

        return "en" if english_chars > tamil_chars else "ta"

    except Exception as e:
        logger.error(f"Language detection failed: {e}")
        return "ta"


# =========================
# AGENT
# =========================

class FoodOrderAgent(Agent):
    def __init__(self):
        self.customer_name = "விருந்தினர்"
        self.current_order = []
        self.order_confirmed = False
        self.bill_generated = False
        self.current_language = "ta"

        super().__init__(
            instructions=(
                "You are a food court voice assistant.\n"
                "STRICT LANGUAGE RULES:\n"
                "- Default speak ONLY Tamil.\n"
                "- If user speaks English, switch to ONLY English.\n"
                "- Never mix Tamil and English.\n"
                "- Keep responses short and polite.\n"
                "\n"
                "ORDER FLOW:\n"
                "- When user adds items → call add_item.\n"
                "- When user asks summary → call get_order_summary.\n"
                "- When user confirms → call place_order ONCE.\n"
                "- After placing order → call print_bill ONCE.\n"
                "- Never call tools repeatedly.\n"
            ),
            tools=[
                self.add_item,
                self.get_order_summary,
                self.place_order,
                self.print_bill,
            ],
        )

    # 🔥 language switching hook
    async def on_user_message(self, chat_msg):
        self.current_language = detect_language(chat_msg)
        await super().on_user_message(chat_msg)

    async def on_enter(self):
        await self.session.say(
            "வணக்கம்! என்ன ஆர்டர் செய்ய விரும்புகிறீர்கள்?",
            allow_interruptions=True,
        )

    # =========================
    # TOOLS
    # =========================

    @function_tool
    async def add_item(self, item: str, quantity: int = 1) -> str:
        self.current_order.append((item, quantity))

        if self.current_language == "en":
            return f"Added {quantity} {item}."

        return f"{quantity} {item} சேர்க்கப்பட்டது."

    @function_tool
    async def get_order_summary(self, unused: str = None) -> str:
        if not self.current_order:
            return (
                "Your order is empty."
                if self.current_language == "en"
                else "உங்கள் ஆர்டர் காலியாக உள்ளது."
            )

        summary = ", ".join(
            f"{item} - {qty}" for item, qty in self.current_order
        )

        if self.current_language == "en":
            return f"Your order: {summary}"

        return f"உங்கள் ஆர்டர்: {summary}"

    @function_tool
    async def place_order(self, unused: str = None) -> str:
        if self.order_confirmed:
            return (
                "Order already confirmed."
                if self.current_language == "en"
                else "ஆர்டர் ஏற்கனவே உறுதிப்படுத்தப்பட்டது."
            )

        self.order_confirmed = True
        logger.info("Order placed")

        return (
            "Your order has been confirmed."
            if self.current_language == "en"
            else "உங்கள் ஆர்டர் உறுதிப்படுத்தப்பட்டது."
        )

    @function_tool
    async def print_bill(self, unused: str = None) -> str:
        if self.bill_generated:
            return (
                "Bill already generated."
                if self.current_language == "en"
                else "பில் ஏற்கனவே உருவாக்கப்பட்டது."
            )

        self.bill_generated = True
        logger.info("Bill printed")

        return (
            "Your bill is ready."
            if self.current_language == "en"
            else "உங்கள் பில் தயாராக உள்ளது."
        )


# =========================
# ENTRYPOINT
# =========================

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    session = AgentSession(
        vad=VAD_MODEL,
        stt=SarvamSTT(api_key=os.environ["SARVAM_API_KEY"], vad=VAD_MODEL),
        llm=groq.LLM(model="llama-3.3-70b-versatile"),
        tts=SarvamTTS(api_key=os.environ["SARVAM_API_KEY"]),
    )

    await session.start(
        room=ctx.room,
        agent=FoodOrderAgent(),
        room_options=RoomInputOptions(close_on_disconnect=False),
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))