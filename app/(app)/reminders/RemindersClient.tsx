"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, Check, Calendar, Phone, History, Clock } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import type { Gym, MemberStatus, Reminder } from "@/lib/supabase/types";
import MemberAvatar from "@/components/MemberAvatar";
import EmptyState from "@/components/EmptyState";
import { markReminderSent } from "@/app/actions/reminders";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabType = "5" | "3" | "1" | "history";

interface Props {
  gym: Gym;
  fiveDays: MemberStatus[];
  threeDays: MemberStatus[];
  oneDay: MemberStatus[];
  history: Reminder[];
}

const TABS: { key: TabType; label: string; icon: any }[] = [
  { key: "5", label: "5 Days", icon: Clock },
  { key: "3", label: "3 Days", icon: Clock },
  { key: "1", label: "1 Day", icon: Clock },
  { key: "history", label: "History", icon: History },
];

export default function RemindersClient({ gym, fiveDays, threeDays, oneDay, history }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>("5");
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function getMembers(): MemberStatus[] {
    if (tab === "5") return fiveDays;
    if (tab === "3") return threeDays;
    if (tab === "1") return oneDay;
    return [];
  }

  function getDays(): number {
    return tab === "5" ? 5 : tab === "3" ? 3 : 1;
  }

  function handleWhatsApp(m: MemberStatus) {
    const msg = encodeURIComponent(
      `Hi ${m.full_name}! 🏋️ Your ${m.plan_name ?? "membership"} at ${gym.name} expires on ${formatDate(m.end_date)}. Renew now to continue your fitness journey! Call/WhatsApp us: ${gym.phone}`
    );
    window.open(`https://wa.me/91${m.phone.replace(/\D/g, "")}?text=${msg}`, "_blank");

    if (!m.subscription_id) return;

    startTransition(async () => {
      try {
        await markReminderSent(m.id, m.subscription_id!, getDays(), gym.id);
        setSentIds(p => new Set([...p, m.id]));
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  const members = getMembers();

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header Info */}
      <div className="px-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Renewal Reminders</h1>
        <p className="text-sm text-text-secondary mt-1">Nudge members whose subscriptions are expiring soon</p>
      </div>

      {/* Tabs */}
      <div className="sticky top-[56px] z-20 -mx-6 px-6 py-2 bg-page/80 backdrop-blur-md border-b border-border">
        <Tabs value={tab} onValueChange={(v: string) => setTab(v as TabType)}>
          <TabsList className="bg-white border border-border">
            {TABS.map(({ key, label, icon: Icon }) => (
              <TabsTrigger key={key} value={key} className="gap-2">
                <Icon size={14} />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3">
        {tab !== "history" ? (
          members.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Bell}
                message={`No members expiring in exactly ${getDays()} day${getDays() === 1 ? "" : "s"}`}
              />
            </div>
          ) : (
            members.map(m => {
              const currentDays = getDays();
              const autoSentAt = currentDays === 5 ? (m as any).reminder_5_sent_at : 
                                 currentDays === 3 ? (m as any).reminder_3_sent_at : 
                                 (m as any).reminder_1_sent_at;

              const isSent = sentIds.has(m.id) || !!autoSentAt ||
                history.some(r => r.member_id === m.id && r.subscription_id === m.subscription_id && String(r.stage) === tab);

              const accentColor = tab === "5" ? "border-l-[#1A7A5E]" : tab === "3" ? "border-l-[#B85C00]" : "border-l-[#C0392B]";
              const accentText = tab === "5" ? "text-accent-text" : tab === "3" ? "text-status-warning-text" : "text-status-danger-text";

              return (
                <div
                  key={m.id}
                  className={`bg-white border border-border border-l-[4px] ${accentColor} p-4 rounded-xl flex items-center gap-4 hover:border-border-strong transition-all`}
                >
                  <MemberAvatar name={m.full_name} memberId={m.id} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-text-primary truncate mb-0.5">{m.full_name}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Expiry</span>
                        <span className={`text-xs font-bold font-mono ${accentText}`}>{formatDate(m.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Plan</span>
                        <span className="text-xs font-semibold text-text-secondary">{m.plan_name ?? "No plan"}</span>
                      </div>
                    </div>
                  </div>
                  {isSent ? (
                    <div className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-status-success-bg text-status-success-text text-[11px] font-bold uppercase tracking-wider border border-status-success-border">
                      <Check size={14} strokeWidth={3} />
                      Sent
                    </div>
                  ) : (
                    <button
                      onClick={() => handleWhatsApp(m)}
                      disabled={isPending}
                      className="h-10 px-5 rounded-full bg-accent text-white flex items-center gap-2 text-xs font-bold hover:bg-accent-hover transition-all active:scale-95 shadow-sm"
                    >
                      <MessageCircle size={16} />
                      Remind
                    </button>
                  )}
                </div>
              );
            })
          )
        ) : (
          history.length === 0 ? (
            <div className="py-12">
              <EmptyState icon={History} message="No reminder history found" />
            </div>
          ) : (
            <div className="bg-white border border-border rounded-xl divide-y divide-border overflow-hidden">
              {history.map(r => (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-hover transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      r.stage === 5 ? "bg-status-success-bg text-status-success-text" : 
                      r.stage === 3 ? "bg-status-warning-bg text-status-warning-text" : 
                      "bg-status-danger-bg text-status-danger-text"
                    }`}>
                      {r.stage}d
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">Stage {r.stage} reminder sent</p>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                        VIA {r.method} • {new Date(r.sent_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Check size={16} className="text-status-success-text" />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
