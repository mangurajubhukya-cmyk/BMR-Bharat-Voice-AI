export const GNANI_LANGUAGES = [
  { code: "te-IN", label: "తెలుగు / Telugu", voice: "Suhana" },
  { code: "hi-IN", label: "हिन्दी / Hindi", voice: "Nalini" },
  { code: "en-IN", label: "Indian English", voice: "Kaveri" },
] as const;

export type GnaniLanguageCode = (typeof GNANI_LANGUAGES)[number]["code"];
export type GnaniVoice = "Suhana" | "Lehara" | "Lavanya" | "Varuni" | "Yukti" | "Nalini" | "Deepak" | "Kaveri" | "Pranav" | "Poorvi";

export const GNANI_TTS_VOICES: Record<GnaniVoice, { language: GnaniLanguageCode | "hi-en"; label: string }> = {
  Suhana: { language: "te-IN", label: "Suhana · Telugu" },
  Lehara: { language: "te-IN", label: "Lehara · Telugu" },
  Lavanya: { language: "te-IN", label: "Lavanya · Telugu" },
  Varuni: { language: "te-IN", label: "Varuni · Telugu" },
  Yukti: { language: "te-IN", label: "Yukti · Telugu" },
  Nalini: { language: "hi-IN", label: "Nalini · Hindi" },
  Deepak: { language: "hi-IN", label: "Deepak · Hindi" },
  Kaveri: { language: "en-IN", label: "Kaveri · English" },
  Pranav: { language: "en-IN", label: "Pranav · English" },
  Poorvi: { language: "hi-en", label: "Poorvi · Hinglish" },
};

export function isGnaniLanguageCode(value: string): value is GnaniLanguageCode {
  return GNANI_LANGUAGES.some(language => language.code === value);
}

export function isGnaniVoice(value: string): value is GnaniVoice {
  return value in GNANI_TTS_VOICES;
}
