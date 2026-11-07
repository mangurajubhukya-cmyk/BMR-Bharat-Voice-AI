# Official Gnani API notes

Sources consulted:

- https://docs.gnani.ai/api/STT/speech-to-text
- https://docs.gnani.ai/api/TTS/tts-inference
- https://docs.gnani.ai/api/TTS/available-voices

Prisma REST uses `POST https://api.vachana.ai/stt/v3` with `X-API-Key-ID`, multipart `audio_file` and required `language_code`. Prisma v2.5 is the default when `model` is omitted; supported audio includes WAV, MP3, OGG, FLAC, AAC and M4A, with a maximum duration of 30 seconds. Successful responses include `transcript`, `model`, and optionally `detected_language_code`.

Timbre REST uses `POST https://api.vachana.ai/api/v1/tts/inference` with `X-API-Key-ID` and JSON fields `text`, `voice`, `model`, `language`, `speed`, and optional `audio_config`. Timbre v2.5 returns binary audio for successful requests. The implementation requests WAV PCM audio and validates voices against the v2.5 catalog.

Verified v2.5 voices used by this project include Telugu `Suhana`, `Lehara`, `Lavanya`, `Varuni`, `Yukti`; Hindi `Nalini`, `Deepak`; Indian English `Kaveri`, `Pranav`; and Hinglish `Poorvi`.
