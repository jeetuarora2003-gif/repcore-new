"use client";

import React from "react";
import Link from "next/link";
import { Users, UserCheck, Clock, AlertTriangle, Plus, ScanLine, CreditCard, MessageCircle, Bell, Check } from "lucide-react";
import { formatINR, formatDate, memberInitials, getHourGreeting } from "@/lib/helpers";
import type { Gym, MemberStatus } from "@/lib/supabase/types";
import MemberAvatar from "@/components/MemberAvatar";

interface Props {
  gym: Gym;
  stats: { total: number; active: number; expiringThisWeek: number; totalDues: number };
  recentCheckins: Array<{ id: string; checked_in_at: string; member_id: string; members: { full_name: string } | null }>;
  expiringMembers: MemberStatus[];
}

const STAT_CARDS: Array<{
  key: "total" | "active" | "expiringThisWeek" | "totalDues";
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  shadow: string;
  currency?: boolean;
}> = [
  { 
    key: "total", 
    label: "Total Members", 
    icon: Users, 
    color: "text-[#6366F1]", 
    bg: "bg-gradient-to-br from-[#6366F1]/10 to-[#6366F1]/5",
    shadow: "shadow-[0_0_20px_rgba(99,102,241,0.08)]"
  },
  { 
    key: "active", 
    label: "Active", 
    icon: UserCheck, 
    color: "text-[#22C55E]", 
    bg: "bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/5",
    shadow: "shadow-[0_0_20px_rgba(34,197,94,0.08)]"
  },
  { 
    key: "expiringThisWeek", 
    label: "Expiring This Week", 
    icon: Clock, 
    color: "text-[#F59E0B]", 
    bg: "bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5",
    shadow: "shadow-[0_0_20px_rgba(245,158,11,0.08)]"
  },
  { 
    key: "totalDues", 
    label: "Dues Pending", 
    icon: AlertTriangle, 
    color: "text-[#EF4444]", 
    bg: "bg-gradient-to-br from-[#EF4444]/10 to-[#EF4444]/5",
    shadow: "shadow-[0_0_20px_rgba(239,68,68,0.08)]",
    currency: true 
  },
];

const QUICK_ACTIONS = [
  { label: "Add Member", href: "/members?add=1", icon: Plus },
  { label: "Check In", href: "/checkin", icon: ScanLine },
  { label: "Record Payment", href: "/members", icon: CreditCard },
  { label: "Send Reminders", href: "/reminders", icon: Bell },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardClient({ gym, stats, recentCheckins, expiringMembers }: Props) {
  const initials = memberInitials(gym.name);

  return (
    <div className="pb-20 md:pb-8 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0D0D14]/95 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#94A3B8] mb-0.5">{getHourGreeting()}</p>
            <h1 className="text-xl font-extrabold text-[#F1F5F9] leading-tight tracking-tight">{gym.name} 👋</h1>
          </div>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-[#6366F1]/20">
            {initials}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {STAT_CARDS.map(({ key, label, icon: Icon, color, bg, shadow, currency }) => (
            <div 
              key={key} 
              className={`${bg} ${shadow} border border-white/10 rounded-2xl p-5 flex flex-col transition-all duration-200 hover:border-white/15 hover:shadow-black/20`}
            >
              <div className={`h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#94A3B8] mb-1">{label}</p>
              <p className={`text-3xl font-extrabold text-white`}>
                {currency ? formatINR(stats[key] as number) : stats[key]}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4 border-l-2 border-[#6366F1] pl-3">Quick Actions</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
              <div key={label}>
                <Link
                  href={href}
                  className="flex items-center gap-3 h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-semibold whitespace-nowrap transition-all hover:bg-white/10 hover:border-[#6366F1]/50 shadow-sm primary-button"
                >
                  <Icon size={18} className="text-[#6366F1]" />
                  {label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring Members / Reminders */}
        <div>
          <div className="flex items-center justify-between mb-4 border-l-2 border-[#6366F1] pl-3">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Action Needed</p>
            {expiringMembers.length > 0 && (
              <Link href="/reminders" className="text-xs font-bold text-[#6366F1] hover:underline">See all</Link>
            )}
          </div>
          {expiringMembers.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                <Check size={20} className="text-[#22C55E]" />
              </div>
              <p className="text-sm font-medium text-[#22C55E]">All caught up! No reminders needed today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expiringMembers.map((m) => (
                <div 
                  key={m.id} 
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.08] transition-colors group"
                >
                  <MemberAvatar name={m.full_name} memberId={m.id} size="sm" status={m.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{m.full_name}</p>
                    <p className="text-[11px] font-medium text-[#94A3B8]">
                      {m.days_until_expiry === 0
                        ? "Expires today"
                        : `Expires in ${m.days_until_expiry} day${m.days_until_expiry === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/91${m.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${m.full_name}! 🏋️ Your ${m.plan_name ?? "membership"} at ${gym.name} expires on ${formatDate(m.end_date)}. Renew now to continue your fitness journey! Call/WhatsApp us: ${gym.phone}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 w-11 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E] hover:bg-[#22C55E] hover:text-white transition-all shadow-sm"
                  >
                    <MessageCircle size={18} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Check-ins */}
        <div>
          <div className="flex items-center justify-between mb-4 border-l-2 border-[#6366F1] pl-3">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Today</p>
            <Link href="/checkin" className="text-xs font-bold text-[#6366F1] hover:underline">View All →</Link>
          </div>
          {recentCheckins.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <ScanLine size={32} className="text-[#3F3F46] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#94A3B8]">No check-ins yet today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCheckins.map((c) => (
                <div 
                  key={c.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <MemberAvatar name={c.members?.full_name ?? "?"} memberId={c.member_id} size="sm" />
                    <p className="text-sm font-bold text-white">{c.members?.full_name ?? "Unknown"}</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#94A3B8] bg-white/5 px-2 py-1 rounded-lg">{formatTime(c.checked_in_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
