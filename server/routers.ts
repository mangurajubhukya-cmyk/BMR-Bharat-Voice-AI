import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, listLLMModels } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { extractReplyText, makeBmrSystemPrompt, makeConversationTitle } from "./chat";
import { createBmrBillingPortalSession, createBmrCheckoutSession, getBmrSubscriptionSummary, getRequestOrigin } from "./stripe";
import { transcribeVoiceInput } from "./voice";
import {
  createConversation,
  createMessage,
  deleteConversation,
  getConversationForUser,
  listConversationMessages,
  listConversationSummaries,
  renameConversation,
} from "./db";

const idInput = z.object({ conversationId: z.number().int().positive() });
const titleInput = idInput.extend({ title: z.string().trim().min(1).max(160) });

async function chooseChatModel() {
  const { data } = await listLLMModels();
  const preferred = data.find(model => /gpt-4\.1-mini|gpt-4o-mini|claude.*haiku/i.test(model.id));
  const fallback = data.find(model => /gpt|claude|gemini/i.test(model.id)) ?? data[0];
  if (!preferred && !fallback) throw new Error("No AI model is currently available");
  return (preferred ?? fallback).id;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  billing: router({
    checkout: protectedProcedure.input(z.object({ productId: z.enum(["bmr_credit_monthly", "bmr_ultra_monthly"]) })).mutation(async ({ ctx, input }) => {
      const origin = getRequestOrigin(ctx.req);
      const url = await createBmrCheckoutSession(ctx.user, input.productId, origin);
      return { url };
    }),
    status: protectedProcedure.query(({ ctx }) => getBmrSubscriptionSummary(ctx.user)),
    portal: protectedProcedure.mutation(async ({ ctx }) => ({ url: await createBmrBillingPortalSession(ctx.user, getRequestOrigin(ctx.req)) })),
  }),
  voice: router({
    transcribe: protectedProcedure.input(z.object({
      audioBase64: z.string().min(1).max(24_000_000),
      mimeType: z.enum(["audio/webm", "audio/ogg", "audio/wav", "audio/mpeg", "audio/mp4"]),
    })).mutation(async ({ input }) => {
      try {
        return await transcribeVoiceInput(input.audioBase64, input.mimeType);
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Voice transcription could not be completed." });
      }
    }),
  }),
  conversations: router({
    list: protectedProcedure.query(({ ctx }) => listConversationSummaries(ctx.user.id)),
    get: protectedProcedure.input(idInput).query(async ({ ctx, input }) => {
      const conversation = await getConversationForUser(input.conversationId, ctx.user.id);
      if (!conversation) throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
      return { conversation, messages: await listConversationMessages(conversation.id) };
    }),
    create: protectedProcedure.input(z.object({ title: z.string().trim().min(1).max(160) })).mutation(async ({ ctx, input }) => {
      const conversationId = await createConversation(ctx.user.id, input.title);
      return getConversationForUser(conversationId, ctx.user.id);
    }),
    rename: protectedProcedure.input(titleInput).mutation(async ({ ctx, input }) => {
      const conversation = await getConversationForUser(input.conversationId, ctx.user.id);
      if (!conversation) throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
      await renameConversation(input.conversationId, ctx.user.id, input.title);
      return { success: true } as const;
    }),
    delete: protectedProcedure.input(idInput).mutation(async ({ ctx, input }) => {
      const deleted = await deleteConversation(input.conversationId, ctx.user.id);
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
      return { success: true } as const;
    }),
    send: protectedProcedure.input(z.object({
      conversationId: z.number().int().positive().optional(),
      content: z.string().trim().min(1).max(8000),
    })).mutation(async ({ ctx, input }) => {
      let conversationId = input.conversationId;
      let conversation = conversationId
        ? await getConversationForUser(conversationId, ctx.user.id)
        : undefined;

      if (conversationId && !conversation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
      }
      if (!conversation) {
        conversationId = await createConversation(ctx.user.id, makeConversationTitle(input.content));
        conversation = await getConversationForUser(conversationId, ctx.user.id);
      }
      if (!conversation || !conversationId) throw new Error("Unable to create a conversation");

      await createMessage({ conversationId, role: "user", content: input.content });
      const transcript = await listConversationMessages(conversationId);
      const model = await chooseChatModel();
      const llmResponse = await invokeLLM({
        model,
        maxTokens: 900,
        messages: [
          { role: "system", content: makeBmrSystemPrompt("auto") },
          ...transcript.slice(-20).map(message => ({ role: message.role, content: message.content })),
        ],
      });
      const assistantContent = extractReplyText(llmResponse);
      await createMessage({ conversationId, role: "assistant", content: assistantContent });

      return {
        conversationId,
        title: conversation.title,
        assistantContent,
        model: llmResponse.model,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
