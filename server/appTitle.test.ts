import { describe, expect, it } from "vitest";

describe("OAuth application title configuration", () => {
  it("exposes the BMR AI Create Account display title to the application runtime", () => {
    expect(process.env.VITE_APP_TITLE).toBe("BMR AI Create Account");
  });
});
