/**
 * Zynvori AI workspace: a real, authenticated conversation interface with persistent history.
 * The layout keeps the Cognitive Observatory visual language while delegating rendering and composer behavior to AIChatBox.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type Message as DisplayMessage } from "@/components/AIChatBox";
import { ProfileControls } from "@/components/ProfileControls";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { companionFailureFeedback } from "@/lib/chatFeedback";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { BMR_PLAN_CATALOG } from "@shared/plans";
import { Loader2, MessageCircle, MessageSquarePlus, PanelLeftClose, Pencil, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const suggestedPrompts = [
  "Help me turn a vague product idea into a focused one-page brief.",
  "Create a practical risk register for launching an internal AI assistant.",
  "Explain the trade-offs between a faster model and a stronger reasoning model.",
];

function SignalMark({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 64 64" aria-hidden="true" className={className}><rect width="64" height="64" rx="12" fill="#171a15" /><path d="M16 16h32L27 37h21v11H16l21-21H16z" fill="#c7f36b" /></svg>;
}

function formatUpdatedAt(updatedAt: Date) {
  const elapsed = Date.now() - new Date(updatedAt).getTime();
  if (elapsed < 60_000) return "now";
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h`;
  return new Date(updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [hasSelectedInitialConversation, setHasSelectedInitialConversation] = useState(false);

  const conversations = trpc.conversations.list.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 10_000,
  });
  const activeConversation = trpc.conversations.get.useQuery(
    { conversationId: activeConversationId ?? 0 },
    { enabled: isAuthenticated && activeConversationId !== null }
  );
  const billingStatus = trpc.billing.status.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const voiceTranscription = trpc.voice.transcribe.useMutation();
  const activePlan = billingStatus.data?.plan === "bmr_credit_monthly" ? BMR_PLAN_CATALOG.bmr_credit_monthly : billingStatus.data?.plan === "bmr_ultra_monthly" ? BMR_PLAN_CATALOG.bmr_ultra_monthly : BMR_PLAN_CATALOG.free;

  useEffect(() => {
    if (!hasSelectedInitialConversation && conversations.data) {
      setActiveConversationId(conversations.data[0]?.id ?? null);
      setHasSelectedInitialConversation(true);
    }
  }, [conversations.data, hasSelectedInitialConversation]);

  useEffect(() => {
    const checkoutState = new URLSearchParams(window.location.search).get("checkout");
    if (checkoutState === "success") {
      toast.success("BMR plan checkout complete", { description: "Your Stripe subscription is being confirmed. Return to your workspace when ready." });
      void utils.billing.status.invalidate();
    } else if (checkoutState === "cancelled") {
      toast.error("BMR plan checkout cancelled", { description: "No payment was taken. You can continue using your current workspace." });
    }
    if (checkoutState) window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const sendMessage = trpc.conversations.send.useMutation({
    onSuccess: async (result) => {
      setPendingMessage(null);
      setActiveConversationId(result.conversationId);
      await Promise.all([
        utils.conversations.list.invalidate(),
        utils.conversations.get.invalidate({ conversationId: result.conversationId }),
      ]);
    },
    onError: (error) => {
      setPendingMessage(null);
      const feedback = companionFailureFeedback(error.message);
      toast.error(feedback.title, { description: feedback.description });
    },
  });

  const billingPortal = trpc.billing.portal.useMutation({
    onSuccess: ({ url }) => {
      toast.success("Opening secure billing portal", { description: "You can update or cancel your plan with Stripe." });
      window.location.assign(url);
    },
    onError: error => toast.error("Could not open billing portal", { description: error.message }),
  });

  const renameConversation = trpc.conversations.rename.useMutation({
    onSuccess: async () => {
      await utils.conversations.list.invalidate();
      toast.success("Conversation renamed");
    },
    onError: error => toast.error("Could not rename conversation", { description: error.message }),
  });

  const deleteConversation = trpc.conversations.delete.useMutation({
    onSuccess: async (_, variables) => {
      if (activeConversationId === variables.conversationId) setActiveConversationId(null);
      await utils.conversations.list.invalidate();
      toast.success("Conversation deleted");
    },
    onError: error => toast.error("Could not delete conversation", { description: error.message }),
  });

  const displayMessages = useMemo<DisplayMessage[]>(() => {
    if (activeConversationId === null) return pendingMessage ? [{ role: "user", content: pendingMessage }] : [];
    const stored = activeConversation.data?.messages.map(message => ({
      role: message.role,
      content: message.content,
    })) ?? [];
    return pendingMessage ? [...stored, { role: "user", content: pendingMessage }] : stored;
  }, [activeConversation.data?.messages, pendingMessage]);

  function handleSend(content: string) {
    if (!isAuthenticated) {
      startLogin();
      return;
    }
    if (sendMessage.isPending) return;
    setPendingMessage(content);
    sendMessage.mutate({ conversationId: activeConversationId ?? undefined, content });
  }

  function startNewChat() {
    setPendingMessage(null);
    setActiveConversationId(null);
  }

  async function transcribeVoice(audio: { audioBase64: string; mimeType: "audio/webm" | "audio/ogg" | "audio/wav" | "audio/mpeg" | "audio/mp4" }) {
    const result = await voiceTranscription.mutateAsync(audio);
    return result.text;
  }

  function startProCheckout() {
    setLocation("/plans");
  }

  function manageSubscription() {
    if (!isAuthenticated) {
      startLogin();
      return;
    }
    billingPortal.mutate();
  }

  function handleRename(conversationId: number, currentTitle: string) {
    const title = window.prompt("Rename conversation", currentTitle)?.trim();
    if (title && title !== currentTitle) renameConversation.mutate({ conversationId, title });
  }

  async function handleLogout() {
    await logout();
    setActiveConversationId(null);
  }

  if (authLoading) {
    return <div className="grid min-h-screen place-items-center bg-[#10120f] text-[#c7f36b]"><Loader2 className="size-6 animate-spin" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <main className="relative isolate grid min-h-screen overflow-hidden bg-[#10120f] px-6 py-8 text-[#f3f2eb] sm:px-10 lg:grid-cols-[1.1fr_.9fr] lg:px-[9vw]">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(242,241,234,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(242,241,234,.045)_1px,transparent_1px)] [background-size:72px_72px]" />
        <section className="flex max-w-2xl flex-col justify-between py-4 lg:py-12">
          <div className="flex items-center gap-3 font-mono text-[11px] tracking-[.16em] text-[#c7f36b]"><SignalMark className="size-8" /> BMR AI / CHATBOART</div>
          <div className="my-16 lg:my-0">
            <p className="mb-5 flex items-center gap-2 font-mono text-[10px] tracking-[.14em] text-[#c7f36b]"><span className="size-2 rounded-full bg-[#c7f36b]" /> PRIVATE WORKSPACE / READY</p>
            <h1 className="max-w-xl font-['Space_Grotesk'] text-5xl font-semibold leading-[.92] tracking-[-.07em] sm:text-7xl">Bring the work.<br /><span className="text-[#c7f36b]">Keep</span> the context.</h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-[#b8bbb0]">Sign in to start a real conversation with BMR AI CHATBOART. Your chat history is saved to your workspace, so you can return to decisions instead of starting over.</p>
            <Button onClick={startLogin} className="mt-9 h-12 rounded-sm bg-[#c7f36b] px-5 font-semibold text-[#10120f] hover:bg-[#dafb94]">
              Open your workspace <Sparkles className="ml-2 size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-[9px] tracking-[.08em] text-[#888e83]"><span className="flex items-center gap-2"><ShieldCheck className="size-3 text-[#c7f36b]" /> AUTHENTICATED ACCESS</span><span>CONVERSATIONS / PERSISTENT</span></div>
        </section>
        <aside className="my-auto max-w-xl border border-white/15 bg-[#181b16]/85 p-5 shadow-2xl backdrop-blur sm:p-7">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-[9px] tracking-[.13em] text-[#a5aa9e]"><span>WHAT BECOMES AVAILABLE</span><span className="text-[#c7f36b]">01 / 01</span></div>
          <div className="divide-y divide-white/10">
            {[
              ["Persistent conversations", "Keep an organized record of the questions, decisions, and follow-ups that matter."],
              ["Real model responses", "Send a message to the Companion and receive a generated response rather than a prewritten demonstration."],
              ["Workspace control", "Start, rename, and delete conversations whenever your work changes direction."],
            ].map(([title, body], index) => <div key={title} className="py-6"><div className="mb-2 font-mono text-[9px] tracking-[.12em] text-[#c7f36b]">0{index + 1} / CAPABILITY</div><h2 className="font-['Space_Grotesk'] text-2xl font-medium tracking-[-.04em]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#a5aa9e]">{body}</p></div>)}
          </div>
        </aside>
      </main>
    );
  }

  return (
    <main className="flex h-screen min-h-screen overflow-hidden bg-[#10120f] text-[#f3f2eb]">
      <aside className="hidden w-[290px] shrink-0 flex-col border-r border-white/10 bg-[#141712] lg:flex">
        <div className="flex h-[78px] items-center gap-3 border-b border-white/10 px-6"><SignalMark className="size-7" /><div><p className="font-['Space_Grotesk'] text-xs font-semibold tracking-[.14em]">BMR AI / CHATBOART</p><p className="mt-0.5 font-mono text-[8px] tracking-[.12em] text-[#8d9388]">WORKSPACE / ACTIVE</p></div></div>
        <div className="p-4"><Button onClick={startNewChat} className="h-10 w-full justify-start rounded-sm bg-[#c7f36b] px-3 text-sm font-semibold text-[#10120f] hover:bg-[#dafb94]"><MessageSquarePlus className="mr-2 size-4" /> New chat</Button></div>
        <div className="flex items-center gap-2 px-5 pb-3 font-mono text-[9px] tracking-[.12em] text-[#858b80]"><MessageCircle className="size-3 text-[#c7f36b]" /> CHAT HISTORY</div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          {conversations.isLoading ? <div className="grid place-items-center py-10"><Loader2 className="size-4 animate-spin text-[#c7f36b]" /></div> : conversations.data?.length ? conversations.data.map(conversation => (
            <div key={conversation.id} className={`group mb-1 flex items-center gap-2 border px-3 py-2.5 transition-colors ${activeConversationId === conversation.id ? "border-[#c7f36b]/40 bg-[#c7f36b]/10" : "border-transparent hover:bg-white/5"}`}>
              <button className="min-w-0 flex-1 text-left" onClick={() => setActiveConversationId(conversation.id)}><span className="block truncate text-sm text-[#e7e7df]">{conversation.title}</span><span className="mt-1 block font-mono text-[9px] text-[#868c80]">UPDATED {formatUpdatedAt(conversation.updatedAt).toUpperCase()}</span></button>
              <div className="flex opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"><button aria-label={`Rename ${conversation.title}`} className="p-1.5 text-[#a6aba1] hover:text-[#c7f36b]" onClick={() => handleRename(conversation.id, conversation.title)}><Pencil className="size-3" /></button><button aria-label={`Delete ${conversation.title}`} className="p-1.5 text-[#a6aba1] hover:text-red-300" onClick={() => deleteConversation.mutate({ conversationId: conversation.id })}><Trash2 className="size-3" /></button></div>
            </div>
          )) : <div className="px-3 py-8 text-center text-sm leading-6 text-[#838a7f]">No conversations yet. Start with a question worth keeping.</div>}
        </div>
        <ProfileControls name={user?.name} subscription={billingStatus.data} subscriptionLoading={billingStatus.isLoading} billingLoading={billingPortal.isPending} onUpgrade={startProCheckout} onManagePlan={manageSubscription} onLogout={handleLogout} />
      </aside>

      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="w-[86vw] border-white/10 bg-[#141712] p-0 text-[#f3f2eb] sm:max-w-sm">
          <SheetTitle className="sr-only">Chat history and profile</SheetTitle>
          <div className="flex h-full min-h-0 flex-col pt-5">
            <div className="flex items-center gap-3 border-b border-white/10 px-6 pb-5"><SignalMark className="size-7" /><div><p className="font-['Space_Grotesk'] text-xs font-semibold tracking-[.14em]">BMR AI / CHATBOART</p><p className="mt-0.5 font-mono text-[8px] tracking-[.12em] text-[#8d9388]">WORKSPACE / ACTIVE</p></div></div>
            <div className="p-4"><Button onClick={() => { startNewChat(); setIsMobileNavOpen(false); }} className="h-10 w-full justify-start rounded-sm bg-[#c7f36b] px-3 text-sm font-semibold text-[#10120f] hover:bg-[#dafb94]"><MessageSquarePlus className="mr-2 size-4" /> New chat</Button></div>
            <div className="flex items-center gap-2 px-5 pb-3 font-mono text-[9px] tracking-[.12em] text-[#858b80]"><MessageCircle className="size-3 text-[#c7f36b]" /> CHAT HISTORY</div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
              {conversations.data?.length ? conversations.data.map(conversation => <div key={conversation.id} className={`group mb-1 flex items-center gap-2 border px-3 py-2.5 transition-colors ${activeConversationId === conversation.id ? "border-[#c7f36b]/40 bg-[#c7f36b]/10" : "border-transparent hover:bg-white/5"}`}><button className="min-w-0 flex-1 text-left" onClick={() => { setActiveConversationId(conversation.id); setIsMobileNavOpen(false); }}><span className="block truncate text-sm text-[#e7e7df]">{conversation.title}</span><span className="mt-1 block font-mono text-[9px] text-[#868c80]">UPDATED {formatUpdatedAt(conversation.updatedAt).toUpperCase()}</span></button><div className="flex"><button aria-label={`Rename ${conversation.title}`} className="p-1.5 text-[#a6aba1] hover:text-[#c7f36b]" onClick={() => handleRename(conversation.id, conversation.title)}><Pencil className="size-3" /></button><button aria-label={`Delete ${conversation.title}`} className="p-1.5 text-[#a6aba1] hover:text-red-300" onClick={() => deleteConversation.mutate({ conversationId: conversation.id })}><Trash2 className="size-3" /></button></div></div>) : <div className="px-3 py-8 text-center text-sm leading-6 text-[#838a7f]">No conversations yet. Start with a question worth keeping.</div>}
            </div>
            <ProfileControls name={user?.name} subscription={billingStatus.data} subscriptionLoading={billingStatus.isLoading} billingLoading={billingPortal.isPending} onUpgrade={startProCheckout} onManagePlan={manageSubscription} onLogout={handleLogout} />
          </div>
        </SheetContent>
      </Sheet>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_78%_12%,rgba(199,243,107,.08),transparent_26%),#10120f]">
        <header className="flex h-[78px] shrink-0 items-center justify-between border-b border-white/10 px-5 sm:px-8"><div className="flex items-center gap-3"><button type="button" aria-label="Open chat history" onClick={() => setIsMobileNavOpen(true)} className="grid size-8 place-items-center border border-[#c7f36b]/45 bg-[#c7f36b]/10 text-[#c7f36b] transition-colors hover:bg-[#c7f36b]/20 lg:hidden"><PanelLeftClose className="size-4" /></button><div><p className="font-mono text-[9px] tracking-[.13em] text-[#c7f36b]">LIVE ANSWER LOOP</p><h1 className="mt-0.5 font-['Space_Grotesk'] text-base font-medium tracking-[-.03em]">{activeConversation.data?.conversation.title ?? "New conversation"}</h1></div></div><div className="hidden items-center gap-2 font-mono text-[9px] tracking-[.1em] text-[#9fa59a] sm:flex"><span className="size-1.5 rounded-full bg-[#c7f36b]" /> MODEL / READY</div></header>
        <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-6 lg:p-8">
          {activeConversationId !== null && activeConversation.isLoading ? <div className="grid flex-1 place-items-center"><Loader2 className="size-6 animate-spin text-[#c7f36b]" /></div> : <AIChatBox messages={displayMessages} onSendMessage={handleSend} onTranscribeAudio={transcribeVoice} isLoading={sendMessage.isPending} height="auto" className="mx-auto min-h-0 w-full max-w-5xl flex-1 overflow-hidden rounded-sm border-white/12 bg-[#171a15]/90 shadow-[0_24px_80px_rgba(0,0,0,.22)]" emptyStateMessage="Start a new chat in any language. Speak or type naturally and BMR will answer in that same language." suggestedPrompts={["Plan a Client Win Sprint for my service", "Turn this idea into a content brief", "Translate this reply into Telugu", "Help me respond to a customer clearly"]} speechLocale="auto" autoFocus={activeConversationId === null} planContext={activeConversationId === null ? { name: activePlan.name, allowance: activePlan.allowance, onViewPlans: () => setLocation("/plans") } : undefined} />}
          <p className="mx-auto mt-3 flex w-full max-w-5xl items-center gap-2 px-1 font-mono text-[9px] leading-4 tracking-[.06em] text-[#777e73]"><ShieldCheck className="size-3 text-[#c7f36b]" /> RESPONSES ARE GENERATED BY A LIVE MODEL. VERIFY IMPORTANT OUTPUTS BEFORE ACTING.</p>
        </div>
      </section>
    </main>
  );
}
