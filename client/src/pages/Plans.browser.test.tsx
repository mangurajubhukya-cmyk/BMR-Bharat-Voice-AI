// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  auth: { isAuthenticated: true },
  startLogin: vi.fn(),
  checkout: vi.fn(),
  checkoutOptions: undefined as unknown,
  toast: { error: vi.fn() },
}));

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => state.auth }));
vi.mock("@/const", () => ({ startLogin: state.startLogin }));
vi.mock("sonner", () => ({ toast: state.toast }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    billing: {
      checkout: {
        useMutation: (options: unknown) => {
          state.checkoutOptions = options;
          return { mutate: state.checkout, isPending: false };
        },
      },
    },
  },
}));
vi.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button> }));

import Plans from "./Plans";
import Checkout from "./Checkout";

describe("BMR in-app plan journey", () => {
  beforeEach(() => {
    cleanup();
    state.auth.isAuthenticated = true;
    state.startLogin.mockReset();
    state.checkout.mockReset();
    state.toast.error.mockReset();
    state.checkoutOptions = undefined;
    window.history.replaceState({}, "", "/plans");
  });

  afterEach(() => {
    cleanup();
    window.history.replaceState({}, "", "/");
  });

  it("shows transparent Free, $5 Credit, and $18 Ultra capacity before selection", () => {
    render(<Plans />);

    expect(screen.getByRole("heading", { name: "Free Trial" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "BMR Credit" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "BMR Ultra" })).toBeTruthy();
    expect(screen.getByText("10 standard chat replies each day")).toBeTruthy();
    expect(screen.getAllByText("300 BMR credits each month").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1,500 BMR credits each month").length).toBeGreaterThan(0);
  });

  it("keeps paid plan selection in the app before checkout", async () => {
    const user = userEvent.setup();
    render(<Plans />);

    await user.click(screen.getByRole("button", { name: "Choose BMR Credit" }));

    expect(window.location.pathname).toBe("/checkout/bmr_credit_monthly");
  });

  it("sends only the selected tier to the secure checkout procedure", async () => {
    window.history.replaceState({}, "", "/checkout/bmr_ultra_monthly");
    const user = userEvent.setup();
    render(<Checkout />);

    expect(screen.getAllByText("1,500 BMR credits each month").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: /continue to secure payment/i }));
    expect(state.checkout).toHaveBeenCalledWith({ productId: "bmr_ultra_monthly" });
  });

  it("asks signed-out visitors to authenticate rather than starting checkout", async () => {
    state.auth.isAuthenticated = false;
    const user = userEvent.setup();
    render(<Plans />);

    await user.click(screen.getByRole("button", { name: "Choose BMR Ultra" }));
    expect(state.startLogin).toHaveBeenCalledTimes(1);
  });
});
