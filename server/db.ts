import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ChatMessage, conversations, InsertUser, messages, users } from "../drizzle/schema";
import type { LanguagePreference } from "../shared/languages";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function insertId(result: unknown) {
  return Number((result as [{ insertId?: number }])[0]?.insertId ?? 0);
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field];
      updateSet[field] = user[field] ?? null;
    }
  }
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function updateUserLanguage(userId: number, preferredLanguage: LanguagePreference) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.update(users).set({ preferredLanguage }).where(eq(users.id, userId));
}

export async function saveStripeCustomerId(userId: number, stripeCustomerId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.update(users).set({ stripeCustomerId }).where(eq(users.id, userId));
}

export async function listConversationSummaries(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}

export async function createConversation(userId: number, title: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const result = await db.insert(conversations).values({ userId, title });
  return insertId(result);
}

export async function getConversationForUser(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const result = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
    .limit(1);
  return result[0];
}

export async function listConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt), asc(messages.id));
}

export async function createMessage(input: Pick<ChatMessage, "conversationId" | "role" | "content">) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const result = await db.insert(messages).values(input);
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, input.conversationId));
  return insertId(result);
}

export async function renameConversation(conversationId: number, userId: number, title: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db
    .update(conversations)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));
}

export async function deleteConversation(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const conversation = await getConversationForUser(conversationId, userId);
  if (!conversation) return false;
  await db.delete(messages).where(eq(messages.conversationId, conversationId));
  await db.delete(conversations).where(eq(conversations.id, conversationId));
  return true;
}
