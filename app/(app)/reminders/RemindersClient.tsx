"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, Check, Calendar, Phone } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import type { Gym, MemberStatus, Reminder } from "@/lib/supabase/types";
import MemberAvatar from "@/components/MemberAvatar";
import EmptyState from "@/components/EmptyState";
import { markReminderSent } from "@/app/actions/reminders";
import { toast } from "sonner";

type TabType = "5" | "3" | "1" | "history";

interface Props {
  gym: Gym;
  fiveDays: MemberStatus[];
  threeDays: MemberStatus[];
  oneDay: MemberStatus[];
  history: Reminder[];
}

const TABS: { key: TabType; label: string }[] = [
  { key: "5", label: "5 Days" },
  { key: "3", label: "3 Days" },
  { key: "1", label: "1 Day" },
  { key: "history", label: "History" },
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
    <div className="pb-24 min-h-screen bg-[#09090B] animate-fade-up">
      {/* Tab Header */}
      <div className="sticky top-[48px] z-20 bg-[#09090B]/95 backdrop-blur-md border-b border-white/5 px-4 py-4 md:px-8">
        <div className="bg-surface rounded-xl p-1 inline-flex gap-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-6 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                tab === key
                  ? "bg-surface-3 text-[#E4E4E7] shadow-sm"
                  : "text-[#A1A1AA] hover:text-[#E4E4E7] hover:bg-white/3"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 md:px-8 space-y-3">
        {tab !== "history" ? (
          members.length === 0 ? (
            <EmptyState
              icon={Bell}
              message={`No members expiring in exactly ${getDays()} day${getDays() === 1 ? "" : "s"}`}
            />
          ) : (
            members.map(m => {
              const currentDays = getDays();
              const autoSentAt = currentDays === 5 ? m.reminder_5_sent_at : 
                                 currentDays === 3 ? m.reminder_3_sent_at : 
                                 m.reminder_1_sent_at;

              const isSent = sentIds.has(m.id) || !!autoSentAt ||
                history.some(r => r.member_id === m.id && r.subscription_id === m.subscription_id);

              return (
                <div
                  key={m.id}
                  className="card p-4 flex items-center gap-4 hover:border-[#F59E0B]/20 hover:bg-[#F59E0B]/5 transition-all"
                >
                  <MemberAvatar name={m.full_name} memberId={m.id} size="md" rounded="xl" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#E4E4E7] tracking-tight truncate mb-1">{m.full_name}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">Expires</span>
                        <span className="text-xs font-bold text-[#F59E0B] font-mono">{formatDate(m.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">Plan</span>
                        <span className="text-xs text-[#A1A1AA]">{m.plan_name ?? "No plan"}</span>
                      </div>
                    </div>
                  </div>
                  {isSent ? (
                    <div className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#10B981]/10 text-[#10B981] text-[11px] font-bold uppercase tracking-wider border border-[#10B981]/20">
                      <Check size={14} strokeWidth={2.5} />
                      Sent
                    </div>
                  ) : (
                    <button
                      onClick={() => handleWhatsApp(m)}
                      disabled={isPending}
                      className="h-10 px-4 rounded-xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 flex items-center gap-2 text-xs font-semibold hover:bg-[#25D366]/20 transition-all active:scale-95"
                    >
                      <MessageCircle size={16} />
                      Send WhatsApp
                    </button>
                  )}
                </div>
              );
            })
          )
        ) : (
          history.length === 0 ? (
            <EmptyState icon={Bell} message="No reminders sent yet" />
          ) : (
            history.map(r => (
              <div key={r.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                  <div>
                    <p className="text-sm font-medium text-[#E4E4E7]">Stage {r.stage} reminder sent</p>
                    <p className="text-[11px] font-mono text-[#71717A] uppercase mt-0.5">VIA {r.method} • {formatDate(r.sent_at)}</p>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
