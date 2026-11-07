import { GNANI_TTS_VOICES, isGnaniLanguageCode, isGnaniVoice, type GnaniLanguageCode, type GnaniVoice } from "@shared/gnani";
import { ENV } from "./_core/env";
import { gnaniRequest } from "./gnani-client";

let activeRequest: Promise<Uint8Array> | null = null;

export async function synthesizeWithTimbre(text: string, voice: GnaniVoice, language: GnaniLanguageCode | "auto", speed: number) {
  const cleanText = text.trim();
  if (!cleanText || cleanText.length > 4000) throw new Error("Voice playback text must be between 1 and 4,000 characters.");
  if (!isGnaniVoice(voice)) throw new Error("That Timbre voice is not enabled for v2.5.");
  if (language !== "auto" && !isGnaniLanguageCode(language)) throw new Error("Select a supported Indian language for voice playback.");
  if (speed < 0.85 || speed > 1.15) throw new Error("Voice speed must be between 0.85 and 1.15.");
  const preferred = GNANI_TTS_VOICES[voice].language;
  const request = async () => {
    const response = await gnaniRequest("/api/v1/tts/inference", { method: "POST", headers: { "Content-Type": "application/json", Accept: "audio/wav" }, body: JSON.stringify({ text: cleanText, voice, model: ENV.gnaniTtsModel, language: language === "auto" ? "auto" : language || preferred, speed, audio_config: { sample_rate: 24000, num_channels: 1, sample_width: 2, encoding: "linear_pcm", container: "wav" } }) });
    return new Uint8Array(await response.arrayBuffer());
  };
  while (activeRequest) await activeRequest.catch(() => undefined);
  activeRequest = request();
  try { return { audioBase64: Buffer.from(await activeRequest).toString("base64"), mimeType: "audio/wav" as const, voice, language: language === "auto" ? preferred : language }; }
  finally { activeRequest = null; }
}
