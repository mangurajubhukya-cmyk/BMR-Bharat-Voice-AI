export function companionFailureFeedback(message?: string) {
  return {
    title: "The Companion could not answer that yet.",
    description: message?.trim() || "Please try again.",
  };
}
