import { describe, expect, it } from "vitest";
import { companionFailureFeedback } from "./chatFeedback";

describe("companionFailureFeedback", () => {
  it("gives the workspace a clear recovery message when the model fails without details", () => {
    expect(companionFailureFeedback()).toEqual({
      title: "The Companion could not answer that yet.",
      description: "Please try again.",
    });
  });

  it("preserves a useful model error detail for the user", () => {
    expect(companionFailureFeedback("Model temporarily unavailable")).toEqual({
      title: "The Companion could not answer that yet.",
      description: "Model temporarily unavailable",
    });
  });
});
