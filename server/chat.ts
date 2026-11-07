import type { InvokeResult, MessageContent } from "./_core/llm";
import { languageOptionFor } from "../shared/languages";

export const MANUS_COMPANION_SYSTEM_PROMPT = `You are BMR AI CHATBOART, an evidence-first AI workspace for professional teams. Be direct, practical, and transparent about uncertainty. Structure complex answers with concise headings or bullets. Never invent sources, access, or actions you do not have. When a request needs context, ask one focused follow-up question.`;

export function makeBmrSystemPrompt(preferredLanguage: string | null | undefined) {
  const language = languageOptionFor(preferredLanguage);
  const automaticRule = language.id === "auto"
    ? "Detect the language and writing system of the latest user message, including a speech transcription. Reply entirely in that same language and script. Do not switch to English merely because earlier messages were English. If the user mixes languages, follow the predominant language or their explicit request."
    : language.modelInstruction;
  return `${MANUS_COMPANION_SYSTEM_PROMPT}\n\nLanguage behavior: ${automaticRule} Preserve meaningful proper nouns and code as needed. Never claim a translation is exact when there is ambiguity. If the user explicitly requests another language for a single answer, honor that request.`;
}

export function makeConversationTitle(content: string) {
  const compact = content.replace(/\s+/g, " ").trim();
  return compact.length <= 64 ? compact : `${compact.slice(0, 61).trimEnd()}…`;
}

export function extractReplyText(response: InvokeResult) {
  const content = response.choices[0]?.message.content;
  if (!content) return "I could not generate a response. Please try again.";
  if (typeof content === "string") return content.trim();
  return content
    .filter((part): part is Extract<MessageContent, { type: "text" }> => part.type === "text")
    .map(part => part.text)
    .join("\n")
    .trim() || "I could not generate a response. Please try again.";
}
