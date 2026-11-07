import { describe, expect, it } from "vitest";
import { extractReplyText, makeBmrSystemPrompt, makeConversationTitle } from "./chat";

describe("chat response helpers", () => {
  it("creates a compact conversation title", () => {
    expect(makeConversationTitle("  Plan a secure deployment   for our support agent ")).toBe("Plan a secure deployment for our support agent");
  });

  it("extracts a text assistant reply from an AI completion", () => {
    expect(extractReplyText({
      id: "test",
      created: 0,
      model: "test-model",
      choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: "A usable reply." } }],
    })).toBe("A usable reply.");
  });

  it("returns a recovery message when the AI completion has no text", () => {
    expect(extractReplyText({
      id: "test",
      created: 0,
      model: "test-model",
      choices: [],
    })).toBe("I could not generate a response. Please try again.");
  });

  it("includes the chosen Telugu response instruction in the model prompt", () => {
    expect(makeBmrSystemPrompt("te")).toContain("Reply in Telugu");
    expect(makeBmrSystemPrompt("auto")).toContain("Reply entirely in that same language and script");
  });
});
