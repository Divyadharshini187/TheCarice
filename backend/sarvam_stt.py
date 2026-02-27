import aiohttp
import wave
import numpy as np
from livekit.agents import stt
import io
import json
import logging
from livekit.agents.types import APIConnectOptions
from livekit import rtc

logger = logging.getLogger(__name__)

SARVAM_DEFAULT_LANGUAGE = "ta-IN"
SARVAM_DEFAULT_MODEL = "saarika:v2.5"
SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text"


class SarvamSTT(stt.STT):
    def __init__(
        self,
        api_key: str,
        vad=None,
        language: str = SARVAM_DEFAULT_LANGUAGE,
        model: str = SARVAM_DEFAULT_MODEL,
    ):
        super().__init__(
            capabilities=stt.STTCapabilities(
                streaming=False,
                interim_results=False,
            )
        )
        self._api_key = api_key
        self._vad = vad
        self._language = language
        self._model = model

    async def _recognize_impl(
        self,
        buffer: rtc.AudioFrame,
        *,
        language: str | None = None,           # ✅ Now actually used
        conn_options: APIConnectOptions | None = None,  # ✅ Now actually used
    ) -> stt.SpeechEvent:

        # Per-call language override, fallback to instance default
        effective_language = language or self._language

        # Per-call timeout from conn_options, fallback to 30s
        timeout_secs = (
            conn_options.timeout if conn_options and conn_options.timeout else 30.0
        )

        logger.info(
            "STT request — rate: %d, channels: %d, data_len: %d, language: %s",
            buffer.sample_rate,
            buffer.num_channels,
            len(bytes(buffer.data)),
            effective_language,
        )

        # Resample to 16k mono
        resampler = rtc.AudioResampler(
            input_rate=buffer.sample_rate,
            output_rate=16000,
            num_channels=1,
        )
        resampled_frames = resampler.push(buffer)
        resampled_frames += resampler.flush()

        transcript = ""

        if not resampled_frames:
            logger.warning("No resampled frames produced — returning empty transcript.")
        else:
            pcm_bytes = b"".join(bytes(frame.data) for frame in resampled_frames)

            audio_np = np.frombuffer(pcm_bytes, dtype=np.int16)
            if audio_np.size == 0:
                logger.warning("Audio numpy array is empty after resampling.")
            else:
                logger.info("Audio max amplitude: %d", int(np.max(np.abs(audio_np))))

            # Build WAV in memory
            wav_buffer = io.BytesIO()
            with wave.open(wav_buffer, "wb") as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2)
                wav_file.setframerate(16000)
                wav_file.writeframes(pcm_bytes)
            wav_buffer.seek(0)

            form = aiohttp.FormData()
            form.add_field(
                "file",
                wav_buffer.read(),
                filename="audio.wav",
                content_type="audio/wav",
            )
            form.add_field("model", self._model)
            form.add_field("language_code", effective_language)  # ✅ Uses effective_language

            timeout = aiohttp.ClientTimeout(total=timeout_secs)  # ✅ Uses conn_options timeout

            try:
                async with aiohttp.ClientSession(timeout=timeout) as session:
                    async with session.post(
                        SARVAM_STT_URL,
                        headers={"api-subscription-key": self._api_key},
                        data=form,
                    ) as resp:
                        text = await resp.text()
                        logger.info("Sarvam raw response [%d]: %s", resp.status, text)

                        if resp.status == 403:
                            raise Exception(
                                "Invalid Sarvam API key. Check SARVAM_API_KEY in .env.local"
                            )
                        if resp.status != 200:
                            raise Exception(f"Sarvam STT error {resp.status}: {text}")

                        try:
                            data = json.loads(text)
                        except json.JSONDecodeError as e:
                            raise Exception(
                                f"Sarvam STT returned non-JSON response: {text}"
                            ) from e

                        logger.info("Sarvam parsed JSON keys: %s", list(data.keys()) if isinstance(data, dict) else type(data))

                        if isinstance(data, dict):
                            if "transcript" in data:
                                transcript = data["transcript"]
                            elif "text" in data:
                                transcript = data["text"]
                            elif "results" in data and data["results"]:
                                transcript = data["results"][0].get("transcript", "")

                        transcript = transcript.strip()

            except aiohttp.ClientError as e:
                raise Exception(f"Sarvam STT network error: {e}") from e

        if not transcript:
            logger.warning("Sarvam STT returned empty transcript — possible silence or noise.")
        else:
            logger.info("Sarvam STT transcript (len=%d): [%s]", len(transcript), transcript)

        return stt.SpeechEvent(
            type=stt.SpeechEventType.FINAL_TRANSCRIPT,
            alternatives=[
                stt.SpeechData(
                    text=transcript,
                    language=effective_language,   # ✅ Reflects actual language used
                    confidence=1.0,
                )
            ],
        )

    def stream(
        self,
        *,
        language: str | None = None,
        conn_options: APIConnectOptions | None = None,
    ) -> stt.SpeechStream:
        return stt.StreamAdapter(
            stt=self,
            vad=self._vad,
        )