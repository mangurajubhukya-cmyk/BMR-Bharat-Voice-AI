/** @vitest-environment jsdom */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfileControls } from "./ProfileControls";

describe("ProfileControls", () => {
  afterEach(() => cleanup());

  it("keeps the free account upgrade action in the compact profile area", async () => {
    const user = userEvent.setup();
    const onUpgrade = vi.fn();
    render(<ProfileControls name="Mira" onUpgrade={onUpgrade} onManagePlan={vi.fn()} onLogout={vi.fn()} />);

    expect(screen.getByText("Free Trial")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Plans" }));

    expect(onUpgrade).toHaveBeenCalledTimes(1);
  });

  it("gives a Pro subscriber a plan-management entry point rather than an upgrade-only control", async () => {
    const user = userEvent.setup();
    const onManagePlan = vi.fn();
    render(<ProfileControls name="Mira" subscription={{ plan: "pro", status: "active", cancelAtPeriodEnd: false, hasBillingPortal: true }} onUpgrade={vi.fn()} onManagePlan={onManagePlan} onLogout={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Manage" }));

    expect(onManagePlan).toHaveBeenCalledTimes(1);
  });
});
