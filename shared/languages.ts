/**
 * BMR language metadata uses standard BCP 47 locale tags for browser dictation and speech synthesis.
 * "auto" tells the model to answer in the language used by the customer’s latest message.
 */
export const LANGUAGE_OPTIONS = [
  { id: "auto", label: "Automatic / match my message", locale: "auto", modelInstruction: "Automatically detect the language of the latest user message and reply in that same language." },
  { id: "en", label: "English", locale: "en-US", modelInstruction: "Reply in English." },
  { id: "te", label: "తెలుగు / Telugu", locale: "te-IN", modelInstruction: "Reply in Telugu (తెలుగు)." },
  { id: "hi", label: "हिन्दी / Hindi", locale: "hi-IN", modelInstruction: "Reply in Hindi (हिन्दी)." },
  { id: "mr", label: "मराठी / Marathi", locale: "mr-IN", modelInstruction: "Reply in Marathi (मराठी)." },
  { id: "ta", label: "தமிழ் / Tamil", locale: "ta-IN", modelInstruction: "Reply in Tamil (தமிழ்)." },
  { id: "kn", label: "ಕನ್ನಡ / Kannada", locale: "kn-IN", modelInstruction: "Reply in Kannada (ಕನ್ನಡ)." },
  { id: "ml", label: "മലയാളം / Malayalam", locale: "ml-IN", modelInstruction: "Reply in Malayalam (മലയാളം)." },
  { id: "bn", label: "বাংলা / Bengali", locale: "bn-IN", modelInstruction: "Reply in Bengali (বাংলা)." },
  { id: "gu", label: "ગુજરાતી / Gujarati", locale: "gu-IN", modelInstruction: "Reply in Gujarati (ગુજરાતી)." },
  { id: "pa", label: "ਪੰਜਾਬੀ / Punjabi", locale: "pa-IN", modelInstruction: "Reply in Punjabi (ਪੰਜਾਬੀ)." },
  { id: "ur", label: "اردو / Urdu", locale: "ur-IN", modelInstruction: "Reply in Urdu (اردو)." },
  { id: "es", label: "Español / Spanish", locale: "es-ES", modelInstruction: "Reply in Spanish." },
  { id: "fr", label: "Français / French", locale: "fr-FR", modelInstruction: "Reply in French." },
  { id: "de", label: "Deutsch / German", locale: "de-DE", modelInstruction: "Reply in German." },
  { id: "ar", label: "العربية / Arabic", locale: "ar-SA", modelInstruction: "Reply in Arabic (العربية)." },
  { id: "ja", label: "日本語 / Japanese", locale: "ja-JP", modelInstruction: "Reply in Japanese (日本語)." },
  { id: "zh", label: "中文 / Chinese", locale: "zh-CN", modelInstruction: "Reply in Simplified Chinese (中文)." },
] as const;

export type LanguagePreference = (typeof LANGUAGE_OPTIONS)[number]["id"];

export function isLanguagePreference(value: string): value is LanguagePreference {
  return LANGUAGE_OPTIONS.some(option => option.id === value);
}

export function languageOptionFor(value: string | null | undefined) {
  return LANGUAGE_OPTIONS.find(option => option.id === value) ?? LANGUAGE_OPTIONS[0];
}
