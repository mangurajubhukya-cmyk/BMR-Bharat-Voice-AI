/**
 * BMR AI CHATBOART offers. Keep the commercial configuration in one place so live Stripe Price IDs can replace the proposed test price without touching checkout logic.
 */
import type Stripe from "stripe";

export const BMR_CREDIT_MONTHLY = {
  id: "bmr_credit_monthly",
  name: "BMR Credit",
  description: "Monthly BMR AI CHATBOART capacity for focused individual work.",
  displayPrice: "$5/month",
  priceData: {
    currency: "usd",
    unit_amount: 500,
    recurring: { interval: "month" as const },
    product_data: {
      name: "BMR Credit",
      description: "Monthly BMR AI CHATBOART Credit subscription",
    },
  } satisfies Stripe.Checkout.SessionCreateParams.LineItem.PriceData,
} as const;

export const BMR_ULTRA_MONTHLY = {
  id: "bmr_ultra_monthly",
  name: "BMR Ultra",
  description: "Monthly BMR AI CHATBOART capacity for frequent professional workflows.",
  displayPrice: "$18/month",
  priceData: {
    currency: "usd",
    unit_amount: 1800,
    recurring: { interval: "month" as const },
    product_data: {
      name: "BMR Ultra",
      description: "Monthly BMR AI CHATBOART Ultra subscription",
    },
  } satisfies Stripe.Checkout.SessionCreateParams.LineItem.PriceData,
} as const;

export const BMR_PRODUCTS = {
  [BMR_CREDIT_MONTHLY.id]: BMR_CREDIT_MONTHLY,
  [BMR_ULTRA_MONTHLY.id]: BMR_ULTRA_MONTHLY,
} as const;

export type BmrProductId = keyof typeof BMR_PRODUCTS;
