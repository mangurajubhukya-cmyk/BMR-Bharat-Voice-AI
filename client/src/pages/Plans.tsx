/**
 * BMR AI CHATBOART in-app pricing page: users compare transparent daily and monthly capacity before starting a secure checkout in the current browser tab.
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { BMR_PLAN_CATALOG, type PaidBmrPlanId } from "@shared/plans";
import { Check, ChevronLeft, Crown, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Plans() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const plans = Object.values(BMR_PLAN_CATALOG);

  function choosePlan(planId: PaidBmrPlanId) {
    if (!isAuthenticated) {
      startLogin();
      return;
    }
    setLocation(`/checkout/${planId}`);
  }

  return (
    <main className="min-h-screen bg-[#10120f] px-4 py-8 text-[#f4f3eb] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <button type="button" onClick={() => setLocation("/")} className="mb-12 inline-flex items-center gap-2 font-mono text-[10px] tracking-[.12em] text-[#b7bdb2] transition-colors hover:text-[#c7f36b]"><ChevronLeft className="size-3.5" /> BACK TO WORKSPACE</button>
        <section className="max-w-3xl">
          <p className="font-mono text-[10px] tracking-[.16em] text-[#c7f36b]">BMR AI / PLANS & CAPACITY</p>
          <h1 className="mt-4 font-['Space_Grotesk'] text-4xl font-medium tracking-[-.06em] sm:text-6xl">Choose the amount of AI work you actually need.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#aeb3aa]">Use BMR in a modern browser from anywhere. Upgrade only when your client work, content, and customer workflows need more capacity. Your selected plan is visible before purchase and manageable in your profile.</p>
        </section>
        <section className="mt-12 grid gap-4 lg:grid-cols-3">
          {plans.map(plan => (
            <article key={plan.id} className={`flex min-h-[420px] flex-col border p-6 ${"featured" in plan && plan.featured ? "border-[#c7f36b] bg-[#c7f36b]/[.06]" : "border-white/12 bg-white/[.025]"}`}>
              <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[9px] tracking-[.14em] text-[#a5aa9e]">{plan.id === "free" ? "START HERE" : "MONTHLY CAPACITY"}</p><h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-medium">{plan.name}</h2></div>{"featured" in plan && plan.featured ? <Crown className="size-5 text-[#c7f36b]" /> : <Sparkles className="size-5 text-[#a9afa3]" />}</div>
              <p className="mt-4 text-sm leading-6 text-[#aeb3aa]">{plan.description}</p>
              <div className="mt-7"><span className="font-['Space_Grotesk'] text-4xl font-medium">{plan.displayPrice}</span><span className="ml-2 font-mono text-[10px] tracking-[.08em] text-[#8e958a]">{plan.interval.toUpperCase()}</span><p className="mt-3 border-t border-white/10 pt-3 text-sm font-medium text-[#e9ece3]">{plan.allowance}</p></div>
              <ul className="mt-6 space-y-3 text-sm leading-5 text-[#c7cbc2]">{plan.features.map(feature => <li key={feature} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-[#c7f36b]" />{feature}</li>)}</ul>
              <div className="mt-auto pt-8">{plan.checkoutEligible ? <Button onClick={() => choosePlan(plan.id)} className={`h-11 w-full rounded-none font-semibold ${"featured" in plan && plan.featured ? "bg-[#c7f36b] text-[#10120f] hover:bg-[#dafb94]" : "border border-white/20 bg-transparent text-white hover:border-[#c7f36b]/60 hover:bg-[#c7f36b]/10"}`}>Choose {plan.name}</Button> : <Button variant="outline" onClick={() => setLocation("/")} className="h-11 w-full rounded-none border-white/20 bg-transparent text-white hover:border-[#c7f36b]/60 hover:bg-[#c7f36b]/10">Continue with Free</Button>}</div>
            </article>
          ))}
        </section>
        {user?.role === "admin" ? <section className="mt-8 border border-amber-200/20 bg-amber-100/[.035] p-5"><p className="font-mono text-[10px] tracking-[.12em] text-amber-200">OWNER / GLOBAL PAYMENTS STATUS</p><h2 className="mt-2 font-['Space_Grotesk'] text-2xl">Worldwide browser access does not mean every merchant country has the same payment onboarding.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#c8c7bd]">Customers can use BMR worldwide. However, the merchant’s Stripe account must be eligible for its own business country. This project is currently in a test sandbox: test cards do not move money and no payout bank account is connected.</p><ol className="mt-4 grid gap-3 text-sm leading-6 text-[#b9bdb4] sm:grid-cols-3"><li><span className="font-mono text-[#c7f36b]">01 / </span>Claim and test the sandbox without moving funds.</li><li><span className="font-mono text-[#c7f36b]">02 / </span>Complete country-specific Stripe live verification and add a payout bank account directly in Stripe.</li><li><span className="font-mono text-[#c7f36b]">03 / </span>Set live products, tax, refunds, portal rules, and webhooks before activating live keys.</li></ol></section> : null}
        <p className="mt-7 font-mono text-[9px] leading-5 tracking-[.07em] text-[#81887d]">PRICES ARE IN USD. PAID PLANS RENEW MONTHLY UNTIL CANCELLED THROUGH YOUR SECURE PROFILE BILLING PORTAL. CREDIT-METERING POLICY MUST BE FINALIZED BEFORE LIVE CHARGES.</p>
      </div>
    </main>
  );
}
