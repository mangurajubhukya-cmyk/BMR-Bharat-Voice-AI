/**
 * User-facing BMR plan catalog. Stripe pricing is derived server-side; the browser only reads product language, limits, and upgrade comparisons.
 */
export const BMR_PLAN_CATALOG = {
  free: {
    id: "free",
    name: "Free Trial",
    displayPrice: "$0",
    interval: "daily reset",
    description: "A daily way to evaluate BMR before paying.",
    allowance: "10 standard chat replies each day",
    features: ["10 standard replies every day", "All language choices", "Text chat and supported browser voice", "Saved conversations"],
    checkoutEligible: false,
  },
  bmr_credit_monthly: {
    id: "bmr_credit_monthly",
    name: "BMR Credit",
    displayPrice: "$5",
    interval: "per month",
    description: "For focused individual work and a small number of high-value tasks.",
    allowance: "300 BMR credits each month",
    features: ["300 BMR credits each month", "Guided Client, Content, and Reply workboards", "Priority response capacity", "Manage or cancel anytime in Stripe"],
    checkoutEligible: true,
  },
  bmr_ultra_monthly: {
    id: "bmr_ultra_monthly",
    name: "BMR Ultra",
    displayPrice: "$18",
    interval: "per month",
    description: "For professionals who run frequent client, content, and customer workflows.",
    allowance: "1,500 BMR credits each month",
    features: ["1,500 BMR credits each month", "Higher capacity for complex workboards", "Priority response capacity", "Manage or cancel anytime in Stripe"],
    checkoutEligible: true,
    featured: true,
  },
} as const;

export type BmrPlanId = keyof typeof BMR_PLAN_CATALOG;
export type PaidBmrPlanId = Exclude<BmrPlanId, "free">;

export function isPaidBmrPlan(value: string): value is PaidBmrPlanId {
  return value === "bmr_credit_monthly" || value === "bmr_ultra_monthly";
}
