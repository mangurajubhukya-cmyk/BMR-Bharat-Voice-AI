import { GNANI_LANGUAGES, type GnaniLanguageCode } from "@shared/gnani";
import { ENV } from "./_core/env";
import { gnaniRequest } from "./gnani-client";
import { validateGnaniAudio } from "./gnani-audio";

export async function transcribeWithPrisma(audioBase64: string, mimeType: string, languageCode: GnaniLanguageCode) {
  if (!GNANI_LANGUAGES.some(language => language.code === languageCode)) throw new Error("Select Telugu, Hindi, or Indian English before recording.");
  const audio = validateGnaniAudio(audioBase64, mimeType);
  const form = new FormData();
  const extension = mimeType === "audio/wav" ? "wav" : mimeType === "audio/mpeg" ? "mp3" : mimeType === "audio/ogg" ? "ogg" : mimeType === "audio/flac" ? "flac" : mimeType === "audio/mp4" || mimeType === "audio/x-m4a" ? "m4a" : "aac";
  form.append("audio_file", new Blob([new Uint8Array(audio)], { type: mimeType }), `bmr-voice.${extension}`);
  form.append("language_code", languageCode);
  if (ENV.gnaniSttModel !== "prisma-v2.5") form.append("model", ENV.gnaniSttModel);
  const response = await gnaniRequest("/stt/v3", { method: "POST", body: form });
  const result = await response.json() as { transcript?: unknown; model?: unknown; detected_language_code?: unknown; request_id?: unknown };
  const transcript = typeof result.transcript === "string" ? result.transcript.trim() : "";
  if (!transcript) throw new Error("Gnani did not detect speech. Please try again or type your message.");
  return { text: transcript, model: typeof result.model === "string" ? result.model : "prisma-v2.5", detectedLanguage: typeof result.detected_language_code === "string" ? result.detected_language_code : languageCode, requestId: typeof result.request_id === "string" ? result.request_id : null };
}
