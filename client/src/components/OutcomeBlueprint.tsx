/**
 * BMR AI CHATBOART outcome blueprints: concise, evidence-aware workboard starters that turn a blank chat into a guided professional workflow.
 */
import { Button } from "@/components/ui/button";
import { ArrowUpRight, BadgeDollarSign, CheckCircle2, FilePenLine, MessageSquareText } from "lucide-react";
import React from "react";

type OutcomeBlueprintProps = {
  onStart: (prompt: string) => void;
  onUpgrade: () => void;
  disabled?: boolean;
};

const blueprints = [
  {
    id: "client-win",
    icon: BadgeDollarSign,
    eyebrow: "01 / CLIENT WIN SPRINT",
    title: "Package expertise into a clear offer",
    outcome: "Offer brief · discovery questions · proposal outline · proof checklist",
    prompt: `Start a Client Win Sprint. First ask me for my skill, ideal client, current proof, and the manual problem I solve. Then help me create: (1) a narrowly scoped offer, (2) discovery questions, (3) a proposal outline, (4) a value hypothesis using only my own inputs, and (5) a proof and follow-up checklist. Do not promise income, fabricate results, or recommend mass outreach. Flag assumptions for my review.`,
  },
  {
    id: "content-lead",
    icon: FilePenLine,
    eyebrow: "02 / CONTENT-TO-LEAD STUDIO",
    title: "Turn a real insight into a useful asset",
    outcome: "Audience angle · source plan · draft · CTA experiment · review pass",
    prompt: `Start a Content-to-Lead Studio board. Ask me for my audience, real experience or source material, platform, and business goal. Create a source-aware content brief, a draft in my voice, two practical calls to action, and a review checklist for facts, disclosures, and originality. Do not invent sources, numbers, testimonials, or earnings claims. Keep the final decision and publishing approval with me.`,
  },
  {
    id: "reply-desk",
    icon: MessageSquareText,
    eyebrow: "03 / CUSTOMER REPLY DESK",
    title: "Respond faster without losing trust",
    outcome: "Inquiry map · response library · qualification questions · follow-up sequence",
    prompt: `Start a Customer Reply Desk. Ask me about my service, common customer questions, non-negotiable boundaries, and tone. Build a reusable response library, lead-qualification questions, and a polite follow-up sequence that I can approve before sending. Avoid manipulative sales tactics, unsupported claims, financial advice, or automated outreach without my review.`,
  },
];

export function OutcomeBlueprint({ onStart, onUpgrade, disabled = false }: OutcomeBlueprintProps) {
  return (
    <section aria-label="Choose your workboard" className="mx-auto mb-3 w-full max-w-5xl rounded-sm border border-[#c7f36b]/25 bg-[#161a14] p-3 shadow-[0_12px_38px_rgba(0,0,0,.18)] sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-4 border-b border-white/8 pb-3">
        <div>
          <p className="font-mono text-[9px] tracking-[.14em] text-[#c7f36b]">CHOOSE YOUR WORK / NOT ANOTHER BLANK CHAT</p>
          <h2 className="mt-1 font-['Space_Grotesk'] text-base font-medium tracking-[-.03em] text-[#f2f3eb]">Start from an outcome you can review and use.</h2>
        </div>
        <CheckCircle2 className="size-5 shrink-0 text-[#c7f36b]" aria-hidden="true" />
      </div>
      <div className="grid gap-2 lg:grid-cols-3">
        {blueprints.map(({ id, icon: Icon, eyebrow, title, outcome, prompt }) => (
          <article key={id} className="flex min-w-0 flex-col border border-white/10 bg-black/10 p-3 transition-colors hover:border-[#c7f36b]/35 hover:bg-[#c7f36b]/[.035]">
            <div className="flex items-start gap-2"><Icon className="mt-0.5 size-4 shrink-0 text-[#c7f36b]" aria-hidden="true" /><p className="font-mono text-[8px] tracking-[.12em] text-[#aab0a5]">{eyebrow}</p></div>
            <h3 className="mt-3 text-sm font-medium leading-5 text-[#f0f1e9]">{title}</h3>
            <p className="mt-1.5 min-h-9 text-xs leading-4 text-[#aab0a5]">{outcome}</p>
            <Button type="button" variant="ghost" disabled={disabled} onClick={() => onStart(prompt)} className="mt-3 h-8 justify-between rounded-none border border-white/10 px-2 text-left text-[11px] text-[#d8ddd1] hover:border-[#c7f36b]/40 hover:bg-[#c7f36b]/10 hover:text-[#c7f36b]">
              Open workboard <ArrowUpRight className="size-3.5" />
            </Button>
          </article>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-3 border-t border-white/8 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-[#aab0a5]"><span className="font-medium text-[#f0f1e9]">BMR plans from $5 per month</span> — retain workboards, reusable templates, voice intake, and review-first planning.</p>
        <Button type="button" disabled={disabled} onClick={onUpgrade} className="h-9 shrink-0 rounded-none bg-[#c7f36b] px-3 text-xs font-semibold text-[#10120f] hover:bg-[#dafb94]">Compare BMR plans <ArrowUpRight className="ml-1.5 size-3.5" /></Button>
      </div>
      <p className="mt-3 font-mono text-[8px] tracking-[.07em] text-[#7d8579]">BMR MAKES A DRAFT AND A REVIEW PLAN — YOU MAKE THE FINAL BUSINESS DECISION.</p>
    </section>
  );
}
