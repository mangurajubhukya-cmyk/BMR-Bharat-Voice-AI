/**
 * Secure server-side Stripe helpers for BMR AI CHATBOART. The browser receives only a hosted Checkout URL, never Stripe credentials or payment secrets.
 */
import type { User } from "../drizzle/schema";
import Stripe from "stripe";
import { BMR_PRODUCTS, type BmrProductId } from "./products";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe is not configured. Update Settings → Payment before accepting purchases.");
  return new Stripe(secretKey);
}

export function getRequestOrigin(req: { get: (name: string) => string | undefined; protocol?: string }) {
  const origin = req.get("origin");
  if (origin) return origin;
  const host = req.get("host");
  if (!host) throw new Error("Could not determine the checkout return URL");
  return `${req.protocol ?? "https"}://${host}`;
}

export function buildCheckoutSessionParams(user: User, productId: BmrProductId, origin: string): Stripe.Checkout.SessionCreateParams {
  const product = BMR_PRODUCTS[productId];
  return {
    mode: "subscription",
    line_items: [{ price_data: product.priceData, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: user.id.toString(),
    customer: user.stripeCustomerId ?? undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email ?? undefined,
    metadata: {
      user_id: user.id.toString(),
      customer_email: user.email ?? "",
      customer_name: user.name ?? "",
      product_id: productId,
    },
    subscription_data: {
      metadata: {
        user_id: user.id.toString(),
        product_id: productId,
      },
    },
    success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?checkout=cancelled`,
  };
}

export async function createBmrCheckoutSession(user: User, productId: BmrProductId, origin: string) {
  const session = await getStripe().checkout.sessions.create(buildCheckoutSessionParams(user, productId, origin));
  if (!session.url) throw new Error("Stripe did not return a Checkout URL");
  return session.url;
}

export type BmrSubscriptionSummary = {
  plan: "free" | "pro" | BmrProductId;
  status: string;
  cancelAtPeriodEnd: boolean;
  hasBillingPortal: boolean;
};

export async function getBmrSubscriptionSummary(user: User): Promise<BmrSubscriptionSummary> {
  if (!user.stripeCustomerId) return { plan: "free", status: "No active subscription", cancelAtPeriodEnd: false, hasBillingPortal: false };
  const subscriptions = await getStripe().subscriptions.list({ customer: user.stripeCustomerId, status: "all", limit: 10 });
  const active = subscriptions.data.find(subscription => ["active", "trialing", "past_due", "unpaid"].includes(subscription.status));
  if (!active) return { plan: "free", status: "No active subscription", cancelAtPeriodEnd: false, hasBillingPortal: true };
  const productId = active.metadata.product_id;
  const plan: BmrSubscriptionSummary["plan"] = productId in BMR_PRODUCTS ? productId as BmrProductId : "pro";
  return { plan, status: active.status, cancelAtPeriodEnd: active.cancel_at_period_end, hasBillingPortal: true };
}

export async function createBmrBillingPortalSession(user: User, origin: string) {
  if (!user.stripeCustomerId) throw new Error("No Stripe billing account is available yet. Choose a BMR plan first to begin a subscription.");
  const session = await getStripe().billingPortal.sessions.create({ customer: user.stripeCustomerId, return_url: `${origin}/?billing=returned` });
  if (!session.url) throw new Error("Stripe did not return a billing-management URL");
  return session.url;
}

export function verifyStripeEvent(rawBody: Buffer, signature: string | undefined) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !signature) throw new Error("Stripe webhook signature is unavailable");
  return getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
}
