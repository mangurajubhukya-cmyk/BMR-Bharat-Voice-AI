import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createConversation: vi.fn(),
  createMessage: vi.fn(),
  deleteConversation: vi.fn(),
  getConversationForUser: vi.fn(),
  invokeLLM: vi.fn(),
  listConversationMessages: vi.fn(),
  listConversationSummaries: vi.fn(),
  listLLMModels: vi.fn(),
  renameConversation: vi.fn(),
  createBmrBillingPortalSession: vi.fn(),
  createBmrCheckoutSession: vi.fn(),
  getBmrSubscriptionSummary: vi.fn(),
  getRequestOrigin: vi.fn(),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: mocks.invokeLLM,
  listLLMModels: mocks.listLLMModels,
}));

vi.mock("./db", () => ({
  createConversation: mocks.createConversation,
  createMessage: mocks.createMessage,
  deleteConversation: mocks.deleteConversation,
  getConversationForUser: mocks.getConversationForUser,
  listConversationMessages: mocks.listConversationMessages,
  listConversationSummaries: mocks.listConversationSummaries,
  renameConversation: mocks.renameConversation,
}));

vi.mock("./stripe", () => ({
  createBmrBillingPortalSession: mocks.createBmrBillingPortalSession,
  createBmrCheckoutSession: mocks.createBmrCheckoutSession,
  getBmrSubscriptionSummary: mocks.getBmrSubscriptionSummary,
  getRequestOrigin: mocks.getRequestOrigin,
}));

import { appRouter } from "./routers";

const user = {
  id: 1,
  openId: "test-user",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "manus",
  preferredLanguage: "auto",
  stripeCustomerId: null,
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createAuthContext(): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("conversations.send model failure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createConversation.mockResolvedValue(42);
    mocks.getConversationForUser.mockResolvedValue({ id: 42, userId: 1, title: "Test chat" });
    mocks.createMessage.mockResolvedValue(1);
    mocks.listConversationMessages.mockResolvedValue([{ id: 1, conversationId: 42, role: "user", content: "Hello", createdAt: new Date() }]);
    mocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-4o-mini" }] });
    mocks.invokeLLM.mockRejectedValue(new Error("Model temporarily unavailable"));
  });

  it("surfaces the model failure to the client after recording the user message", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    await expect(caller.conversations.send({ content: "Hello" })).rejects.toThrow("Model temporarily unavailable");
    expect(mocks.createMessage).toHaveBeenCalledWith({ conversationId: 42, role: "user", content: "Hello" });
  });
});

describe("billing access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getRequestOrigin.mockReturnValue("https://bmr.example");
    mocks.getBmrSubscriptionSummary.mockResolvedValue({ plan: "pro", status: "active", cancelAtPeriodEnd: false, hasBillingPortal: true });
    mocks.createBmrBillingPortalSession.mockResolvedValue("https://billing.example/portal");
  });

  it("returns a subscription summary and a short-lived billing portal URL only for an authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    await expect(caller.billing.status()).resolves.toMatchObject({ plan: "pro", status: "active" });
    await expect(caller.billing.portal()).resolves.toEqual({ url: "https://billing.example/portal" });
    expect(mocks.createBmrBillingPortalSession).toHaveBeenCalledWith(user, "https://bmr.example");
  });
});
