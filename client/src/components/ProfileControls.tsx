/**
 * BMR account controls: a compact, bottom-of-navigation home for profile and Stripe-backed plan actions.
 */
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, Sparkles } from "lucide-react";
import React from "react";

type SubscriptionStatus = {
  plan: "free" | "pro" | "bmr_credit_monthly" | "bmr_ultra_monthly";
  status: string;
  cancelAtPeriodEnd: boolean;
  hasBillingPortal: boolean;
};

type ProfileControlsProps = {
  name?: string | null;
  subscription?: SubscriptionStatus;
  subscriptionLoading?: boolean;
  billingLoading?: boolean;
  onUpgrade: () => void;
  onManagePlan: () => void;
  onLogout: () => void;
};

export function ProfileControls({ name, subscription, subscriptionLoading = false, billingLoading = false, onUpgrade, onManagePlan, onLogout }: ProfileControlsProps) {
  const isPaid = subscription?.plan !== undefined && subscription.plan !== "free";
  const planName = subscription?.plan === "bmr_credit_monthly" ? "BMR Credit" : subscription?.plan === "bmr_ultra_monthly" ? "BMR Ultra" : isPaid ? "BMR paid plan" : "Free Trial";

  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><div className="grid size-7 shrink-0 place-items-center rounded-full bg-[#c7f36b] text-xs font-semibold text-[#10120f]">{name?.slice(0, 1).toUpperCase() ?? "U"}</div><div className="min-w-0"><p className="truncate text-xs text-[#e8e8e0]">{name ?? "Workspace user"}</p><p className="font-mono text-[7px] tracking-[.08em] text-[#858b80]">SECURE SESSION</p></div></div><Button variant="ghost" onClick={onLogout} className="h-7 shrink-0 px-2 text-[10px] text-[#aab0a5] hover:bg-white/5 hover:text-white">Sign out</Button></div>
      <div className="mt-2 flex items-center gap-2 border border-white/10 bg-black/10 p-2"><div className="grid size-6 shrink-0 place-items-center text-[#c7f36b]">{subscriptionLoading ? <Loader2 className="size-3 animate-spin" /> : <CreditCard className="size-3" />}</div><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-medium text-[#eef0e8]">{subscriptionLoading ? "Checking plan…" : planName}</p><p className="truncate font-mono text-[7px] tracking-[.05em] text-[#92988d]">{subscription?.cancelAtPeriodEnd ? "CANCELS AT PERIOD END" : subscription?.status ?? "DAILY ACCESS"}</p></div>{isPaid && subscription?.hasBillingPortal ? <Button type="button" variant="outline" disabled={billingLoading} onClick={onManagePlan} className="h-7 shrink-0 rounded-none border-white/15 bg-transparent px-2 text-[10px] text-[#d7dcd2] hover:border-[#c7f36b]/50 hover:bg-[#c7f36b]/10 hover:text-[#c7f36b]">Manage</Button> : <Button type="button" disabled={billingLoading} onClick={onUpgrade} className="h-7 shrink-0 rounded-none bg-[#c7f36b] px-2 text-[10px] font-semibold text-[#10120f] hover:bg-[#dafb94]"><Sparkles className="mr-1 size-3" />Plans</Button>}</div>
    </div>
  );
}
