# sarvam_tts.py
import aiohttp
import base64
import wave
import io
import logging
import numpy as np
from livekit.agents import tts, utils
from livekit.agents.types import APIConnectOptions

logger = logging.getLogger(__name__)

SARVAM_SAMPLE_RATE = 22050
SARVAM_CHANNELS = 1


class SarvamTTS(tts.TTS):
    def __init__(self, api_key: str, language: str = "ta-IN", speaker: str = "anushka"):
        super().__init__(
            capabilities=tts.TTSCapabilities(streaming=False),
            sample_rate=SARVAM_SAMPLE_RATE,
            num_channels=SARVAM_CHANNELS,
        )
        self._api_key = api_key
        self._language = language
        self._speaker = speaker

    def synthesize(
        self,
        text: str,
        *,
        conn_options: APIConnectOptions | None = None,
        **kwargs,
    ) -> "SarvamStream":
        return SarvamStream(
            tts=self,
            input_text=text,
            api_key=self._api_key,
            language=self._language,
            speaker=self._speaker,
            conn_options=conn_options or APIConnectOptions(),
        )


class SarvamStream(tts.ChunkedStream):
    def __init__(
        self,
        *,
        tts: SarvamTTS,
        input_text: str,
        api_key: str,
        language: str,
        speaker: str,
        conn_options: APIConnectOptions,
    ):
        super().__init__(tts=tts, input_text=input_text, conn_options=conn_options)
        self._api_key = api_key
        self._language = language
        self._speaker = speaker

    async def _run(self, output_emitter: tts.AudioEmitter) -> None:
        request_id = utils.shortuuid()
        text = self.input_text.strip()

        if not text:
            logger.warning("SarvamTTS received empty text, skipping synthesis.")
            return

        logger.debug("SarvamTTS synthesizing: %r", text[:80])

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.sarvam.ai/text-to-speech",
                    headers={
                        "api-subscription-key": self._api_key,
                        "Content-Type": "application/json",
                    },
                    json={
                        "inputs": [text],
                        "target_language_code": self._language,
                        "speaker": self._speaker,
                        "model": "bulbul:v2",
                    },
                ) as resp:
                    if resp.status != 200:
                        error_text = await resp.text()
                        raise Exception(
                            f"Sarvam TTS API error {resp.status}: {error_text}"
                        )

                    data = await resp.json()

            if not data.get("audios"):
                raise Exception(
                    f"Sarvam TTS error: No audio returned in response - {data}"
                )

            wav_bytes = base64.b64decode(data["audios"][0])

        except aiohttp.ClientError as e:
            raise Exception(f"Sarvam TTS network error: {e}") from e

        # Extract PCM from WAV
        wav_io = io.BytesIO(wav_bytes)
        with wave.open(wav_io, "rb") as wf:
            pcm_bytes = wf.readframes(wf.getnframes())
            sample_rate = wf.getframerate()
            channels = wf.getnchannels()
            sampwidth = wf.getsampwidth()

        # Validate sample width (must be 16-bit / 2 bytes)
        if sampwidth != 2:
            raise Exception(
                f"Sarvam TTS returned unexpected sample width: {sampwidth} bytes "
                f"(expected 2 for int16 PCM)"
            )

        # Convert to numpy int16 and push
        audio_np = np.frombuffer(pcm_bytes, dtype=np.int16)

        output_emitter.initialize(
            request_id=request_id,
            sample_rate=sample_rate,
            num_channels=channels,
            mime_type="audio/pcm",
        )

        output_emitter.push(audio_np.tobytes())
        output_emitter.flush()

        logger.debug(
            "SarvamTTS done — sample_rate=%d, channels=%d, frames=%d",
            sample_rate, channels, len(audio_np),
        )