/**
 * Private, server-side voice transcription for BMR. Audio is sent to the configured speech service for immediate transcription and is not written to the application database.
 */
import { ENV } from "./_core/env";

const MAX_AUDIO_BYTES = 16 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set(["audio/webm", "audio/ogg", "audio/wav", "audio/mpeg", "audio/mp4"]);

function extensionFor(mimeType: string) {
  return mimeType === "audio/ogg" ? "ogg" : mimeType === "audio/wav" ? "wav" : mimeType === "audio/mpeg" ? "mp3" : mimeType === "audio/mp4" ? "m4a" : "webm";
}

export async function transcribeVoiceInput(audioBase64: string, mimeType: string) {
  if (!SUPPORTED_MIME_TYPES.has(mimeType)) throw new Error("This audio format is not supported. Please try again or type your message.");
  const audio = Buffer.from(audioBase64, "base64");
  if (!audio.length) throw new Error("The recording was empty. Please try again.");
  if (audio.length > MAX_AUDIO_BYTES) throw new Error("The recording is too large. Keep voice messages under 16 MB.");

  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(audio)], { type: mimeType }), `voice.${extensionFor(mimeType)}`);
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json");
  formData.append("prompt", "Transcribe exactly in the language spoken by the user. Preserve the user's words and script when possible.");

  const baseUrl = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
  const response = await fetch(new URL("v1/audio/transcriptions", baseUrl), {
    method: "POST",
    headers: { authorization: `Bearer ${ENV.forgeApiKey}`, "Accept-Encoding": "identity" },
    body: formData,
  });
  if (!response.ok) throw new Error("Voice transcription is temporarily unavailable. You can still type your message.");
  const result = await response.json() as { text?: unknown; language?: unknown };
  if (typeof result.text !== "string" || !result.text.trim()) throw new Error("BMR could not hear a clear message. Please try again or type it.");
  return { text: result.text.trim(), detectedLanguage: typeof result.language === "string" ? result.language : null };
}
