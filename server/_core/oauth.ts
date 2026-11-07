import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import axios from "axios";

function oauthFailureCategory(error: unknown) {
  if (axios.isAxiosError(error)) return `oauth_http_${error.response?.status ?? "network"}`;
  if (error instanceof Error && /session signing secret|production configuration/i.test(error.message)) return "oauth_configuration";
  if (error instanceof Error && /database|mysql|drizzle/i.test(error.message)) return "database";
  return "callback_internal";
}

function oauthFailureDetails(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as Record<string, unknown> | undefined;
    return {
      name: "AxiosError",
      status: error.response?.status ?? null,
      remoteCode: typeof responseData?.code === "string" ? responseData.code.slice(0, 80) : null,
      remoteMessage: typeof responseData?.message === "string" ? responseData.message.slice(0, 160) : null,
    };
  }
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message.replace(/https?:\/\/\S+/g, "[url]").replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]").slice(0, 240),
    };
  }
  return { name: "UnknownError" };
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.redirect(302, "/?oauth_error=missing_params");
      return;
    }

    // CSRF guard: the nonce in `state` must match the one-time cookie that
    // startLogin set in the browser that began this login. An attacker can
    // forge `state`, but cannot plant this cookie in the victim's browser.
    let nonce: string | undefined;
    try {
      nonce = decodeOAuthState(state).nonce;
    } catch {
      res.redirect(302, "/?oauth_error=invalid_state");
      return;
    }
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.redirect(302, "/?oauth_error=invalid_state");
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });

    let stage = "exchange_code";
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      stage = "get_user_info";
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.redirect(302, "/?oauth_error=missing_identity");
        return;
      }

      stage = "upsert_user";
      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      stage = "create_session";
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "BMR User",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", JSON.stringify({ stage, category: oauthFailureCategory(error), details: oauthFailureDetails(error) }));
      res.redirect(302, "/?oauth_error=callback_failed");
    }
  });
}
