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
  key: keyof typeof EMPTY_STATS;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  currency?: boolean;
}> = [
  { key: "total", label: "Total Members", icon: Users, color: "text-[#6366F1]", bg: "bg-[#6366F1]/10" },
  { key: "active", label: "Active", icon: UserCheck, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
  { key: "expiringThisWeek", label: "Expiring This Week", icon: Clock, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  { key: "totalDues", label: "Dues Pending", icon: AlertTriangle, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", currency: true },
];

const EMPTY_STATS = { total: 0, active: 0, expiringThisWeek: 0, totalDues: 0 };

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
      <div className="sticky top-0 z-20 bg-[#0D0D14]/95 backdrop-blur-md border-b border-[#1E1E30] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#94A3B8]">{getHourGreeting()}</p>
            <h1 className="text-lg font-bold text-[#F1F5F9] leading-tight">{gym.name} 👋</h1>
          </div>
          <div className="h-9 w-9 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {STAT_CARDS.map(({ key, label, icon: Icon, color, bg, currency }) => (
            <div key={key} className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4">
              <div className={`h-8 w-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={color} />
              </div>
              <p className="text-xs text-[#94A3B8] mb-0.5">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>
                {currency ? formatINR(stats[key as keyof typeof stats] as number) : stats[key as keyof typeof stats]}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 h-12 px-4 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] text-[#F1F5F9] text-sm font-medium whitespace-nowrap active:scale-95 transition-transform duration-100 hover:border-[#6366F1]/50"
              >
                <Icon size={15} className="text-[#6366F1]" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Expiring Members / Reminders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Action Needed</p>
            {expiringMembers.length > 0 && (
              <Link href="/reminders" className="text-xs text-[#6366F1]">See all</Link>
            )}
          </div>
          {expiringMembers.length === 0 ? (
            <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[#22C55E]/15 flex items-center justify-center">
                <Check size={16} className="text-[#22C55E]" />
              </div>
              <p className="text-sm text-[#22C55E]">All caught up! No reminders needed today ✓</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expiringMembers.map(m => (
                <div key={m.id} className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4 flex items-center gap-3">
                  <MemberAvatar name={m.full_name} memberId={m.id} size="sm" status={m.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F1F5F9] truncate">{m.full_name}</p>
                    <p className="text-xs text-[#94A3B8]">
                      {m.days_until_expiry === 0
                        ? "Expires today"
                        : `Expires in ${m.days_until_expiry} day${m.days_until_expiry === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/91${m.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${m.full_name}! 🏋️ Your ${m.plan_name ?? "membership"} at ${gym.name} expires on ${formatDate(m.end_date)}. Renew now to continue your fitness journey! Call/WhatsApp us: ${gym.phone}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 w-12 rounded-xl bg-[#22C55E]/15 flex items-center justify-center text-[#22C55E] active:scale-95 transition-transform duration-100"
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
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Today</p>
            <Link href="/checkin" className="text-xs text-[#6366F1]">View All →</Link>
          </div>
          {recentCheckins.length === 0 ? (
            <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-6 text-center">
              <ScanLine size={24} className="text-[#94A3B8] mx-auto mb-2" />
              <p className="text-sm text-[#94A3B8]">No check-ins yet today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCheckins.map(c => (
                <div key={c.id} className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MemberAvatar name={c.members?.full_name ?? "?"} memberId={c.member_id} size="sm" />
                    <p className="text-sm font-medium text-[#F1F5F9]">{c.members?.full_name ?? "Unknown"}</p>
                  </div>
                  <span className="text-xs text-[#94A3B8]">{formatTime(c.checked_in_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
