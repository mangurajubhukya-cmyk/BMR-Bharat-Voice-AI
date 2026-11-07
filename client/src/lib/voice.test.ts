import { describe, expect, it } from "vitest";
import { textForSpeech } from "./voice";

describe("textForSpeech", () => {
  it("removes code fences and markdown decorations before speech playback", () => {
    expect(textForSpeech("## Plan\nUse `scoped` access.\n```ts\nsecret()\n```"))
      .toBe("Plan Use scoped access. Code block omitted.");
  });
});
