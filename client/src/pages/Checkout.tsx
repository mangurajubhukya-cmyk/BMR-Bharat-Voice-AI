/**
 * BMR checkout confirmation keeps plan selection inside the product, then navigates the current tab to Stripe's hosted secure payment page.
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BMR_PLAN_CATALOG, isPaidBmrPlan } from "@shared/plans";
import { Check, ChevronLeft, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const [, params] = useRoute("/checkout/:planId");
  const [, setLocation] = useLocation();
  const planId = params?.planId ?? "";
  const plan = isPaidBmrPlan(planId) ? BMR_PLAN_CATALOG[planId] : null;
  const checkout = trpc.billing.checkout.useMutation({
    onSuccess: ({ url }) => window.location.assign(url),
    onError: error => toast.error("Could not start secure checkout", { description: error.message }),
  });

  if (!plan) return <main className="grid min-h-screen place-items-center bg-[#10120f] p-6 text-[#f4f3eb]"><div className="max-w-md border border-white/12 bg-white/[.03] p-8 text-center"><h1 className="font-['Space_Grotesk'] text-2xl">Choose a BMR plan first</h1><p className="mt-3 text-sm leading-6 text-[#aab0a5]">This plan is not available for secure checkout.</p><Button onClick={() => setLocation("/plans")} className="mt-6 rounded-none bg-[#c7f36b] text-[#10120f] hover:bg-[#dafb94]">View plans</Button></div></main>;
  const selectedPlan = plan;
  function continueToStripe() { if (!isAuthenticated) return startLogin(); checkout.mutate({ productId: selectedPlan.id }); }
  return <main className="grid min-h-screen place-items-center bg-[#10120f] p-4 text-[#f4f3eb]"><section className="w-full max-w-lg border border-white/12 bg-[#161914] p-6 sm:p-9"><button type="button" onClick={() => setLocation("/plans")} className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[.12em] text-[#a8aea2] hover:text-[#c7f36b]"><ChevronLeft className="size-3.5" /> CHANGE PLAN</button><p className="mt-9 font-mono text-[10px] tracking-[.14em] text-[#c7f36b]">CHECKOUT CONFIRMATION</p><h1 className="mt-3 font-['Space_Grotesk'] text-4xl tracking-[-.05em]">{selectedPlan.name}</h1><div className="mt-6 border-y border-white/10 py-5"><div className="flex items-end justify-between"><span className="font-['Space_Grotesk'] text-4xl">{selectedPlan.displayPrice}</span><span className="font-mono text-[10px] tracking-[.08em] text-[#959c91]">{selectedPlan.interval.toUpperCase()}</span></div><p className="mt-4 text-sm font-medium text-[#ecede7]">{selectedPlan.allowance}</p></div><ul className="mt-6 space-y-3 text-sm text-[#c6cbc1]">{selectedPlan.features.map(feature => <li key={feature} className="flex gap-2"><Check className="size-4 shrink-0 text-[#c7f36b]" />{feature}</li>)}</ul><Button disabled={checkout.isPending} onClick={continueToStripe} className="mt-9 h-12 w-full rounded-none bg-[#c7f36b] text-sm font-semibold text-[#10120f] hover:bg-[#dafb94]">{checkout.isPending ? <><Loader2 className="mr-2 size-4 animate-spin" />OPENING SECURE PAYMENT…</> : <><CreditCard className="mr-2 size-4" />CONTINUE TO SECURE PAYMENT</>}</Button><p className="mt-4 flex gap-2 text-[11px] leading-5 text-[#8f968b]"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#c7f36b]" />You remain in this browser tab. Payment details are handled by Stripe; BMR does not store card numbers.</p></section></main>;
}
