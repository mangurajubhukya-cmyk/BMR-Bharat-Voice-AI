import { appRouter } from "../server/routers.ts";
import { getUserByOpenId } from "../server/db.ts";
import { ENV } from "../server/_core/env.ts";

const user = await getUserByOpenId(ENV.ownerOpenId);
if (!user) throw new Error("The project owner does not have an authenticated workspace record yet.");

const ctx = {
  user,
  req: { protocol: "https", headers: {} },
  res: { clearCookie: () => undefined },
};
const caller = appRouter.createCaller(ctx);
let conversationId;

try {
  const result = await caller.conversations.send({
    content: "Reply with exactly: Companion verification ready.",
  });
  conversationId = result.conversationId;
  const freshCaller = appRouter.createCaller({ ...ctx, user: { ...user } });
  const saved = await freshCaller.conversations.get({ conversationId });
  const assistantMessage = saved.messages.at(-1);

  if (saved.messages.length < 2 || assistantMessage?.role !== "assistant" || !assistantMessage.content.trim()) {
    throw new Error("The generated assistant answer was not persisted with the conversation.");
  }

  const updatedTitle = "Companion verification conversation";
  await freshCaller.conversations.rename({ conversationId, title: updatedTitle });
  const history = await freshCaller.conversations.list();
  if (!history.some(conversation => conversation.id === conversationId && conversation.title === updatedTitle)) {
    throw new Error("The renamed conversation was not present in chat history.");
  }

  const expectCode = async (operation, code) => {
    try {
      await operation();
      throw new Error(`Expected ${code} error but the operation succeeded.`);
    } catch (error) {
      if (error?.code !== code) throw error;
    }
  };

  await expectCode(
    () => freshCaller.conversations.send({ content: "" }),
    "BAD_REQUEST"
  );
  await expectCode(
    () => freshCaller.conversations.get({ conversationId: 999999999 }),
    "NOT_FOUND"
  );

  console.log(JSON.stringify({
    status: "verified",
    conversationId,
    model: result.model,
    persistedMessageCount: saved.messages.length,
    assistantPreview: assistantMessage.content.slice(0, 120),
    historyVerified: true,
    errorStatesVerified: true,
  }));
} finally {
  if (conversationId) {
    await caller.conversations.delete({ conversationId });
    const freshCaller = appRouter.createCaller({ ...ctx, user: { ...user } });
    try {
      await freshCaller.conversations.get({ conversationId });
      throw new Error("Deleted conversation was still readable.");
    } catch (error) {
      if (error?.code !== "NOT_FOUND") throw error;
    }
  }
}

process.exit(0);
