/** @vitest-environment jsdom */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OutcomeBlueprint } from "./OutcomeBlueprint";

describe("OutcomeBlueprint", () => {
  afterEach(() => cleanup());

  it("opens the chosen client workflow with a bounded, review-oriented prompt", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<OutcomeBlueprint onStart={onStart} onUpgrade={vi.fn()} />);

    await user.click(screen.getAllByRole("button", { name: /Open workboard/i })[0]);

    expect(onStart).toHaveBeenCalledWith(expect.stringContaining("Client Win Sprint"));
    expect(onStart).toHaveBeenCalledWith(expect.stringContaining("Do not promise income"));
  });

  it("invokes the upgrade action from the BMR plan comparison entry point", async () => {
    const user = userEvent.setup();
    const onUpgrade = vi.fn();
    render(<OutcomeBlueprint onStart={vi.fn()} onUpgrade={onUpgrade} />);

    await user.click(screen.getByRole("button", { name: /Compare BMR plans/i }));

    expect(onUpgrade).toHaveBeenCalledTimes(1);
  });
});
