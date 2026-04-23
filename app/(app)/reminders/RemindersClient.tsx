"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, Check } from "lucide-react";
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
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0D0D14]/95 backdrop-blur-md border-b border-[#1E1E30] px-4 py-3">
        <h1 className="text-lg font-bold text-[#F1F5F9]">Reminders</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1E1E30] px-4">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === key
                ? "border-[#6366F1] text-[#6366F1]"
                : "border-transparent text-[#94A3B8] hover:text-[#F1F5F9]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-2">
        {tab !== "history" ? (
          members.length === 0 ? (
            <EmptyState
              icon={Bell}
              message={`No members expiring in exactly ${getDays()} day${getDays() === 1 ? "" : "s"}`}
            />
          ) : (
            members.map(m => {
              const isSent = sentIds.has(m.id) ||
                history.some(r => r.member_id === m.id && r.subscription_id === m.subscription_id);

              return (
                <div
                  key={m.id}
                  className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4 flex items-center gap-3"
                >
                  <MemberAvatar name={m.full_name} memberId={m.id} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#F1F5F9] truncate">{m.full_name}</p>
                    <p className="text-xs text-[#94A3B8]">Expires: {formatDate(m.end_date)}</p>
                    <p className="text-xs text-[#94A3B8]">{m.plan_name ?? "No plan"}</p>
                  </div>
                  {isSent ? (
                    <div className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-[#22C55E]/10 text-[#22C55E] text-xs font-medium">
                      <Check size={14} />
                      Sent
                    </div>
                  ) : (
                    <button
                      onClick={() => handleWhatsApp(m)}
                      disabled={isPending}
                      className="h-10 w-10 rounded-xl bg-[#22C55E]/15 flex items-center justify-center text-[#22C55E] active:scale-95 transition-transform disabled:opacity-60"
                    >
                      <MessageCircle size={18} />
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
              <div key={r.id} className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#F1F5F9]">Stage {r.stage} reminder</p>
                  <p className="text-xs text-[#94A3B8]">{formatDate(r.sent_at)}</p>
                </div>
                <span className="text-xs bg-[#1C1C2E] text-[#94A3B8] px-2 py-1 rounded-lg">{r.method}</span>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
