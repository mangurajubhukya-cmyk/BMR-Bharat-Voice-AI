import { describe, expect, it } from "vitest";

describe("OAuth application title configuration", () => {
  it("exposes the BMR Bharat Voice AI display title to the application runtime", () => {
    expect(process.env.VITE_APP_TITLE).toBe("BMR Bharat Voice AI");
  });
});
