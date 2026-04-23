"use client";

import { 
  Users, UserCheck, UserMinus, 
  AlertCircle, Plus, ChevronRight,
  TrendingUp, Zap, Bell
} from "lucide-react";
import { formatINR, getHourGreeting } from "@/lib/helpers";
import type { Gym, MemberStatus, Attendance } from "@/lib/supabase/types";
import Link from "next/link";
import MemberAvatar from "@/components/MemberAvatar";

interface Props {
  gym: Gym;
  stats: {
    total: number;
    active: number;
    expiring: number;
    dues: number;
  };
  recentCheckins: (Attendance & { members: MemberStatus })[];
  expiringSoon: MemberStatus[];
}

export default function DashboardClient({ gym, stats, recentCheckins, expiringSoon }: Props) {
  return (
    <div className="relative pb-24 px-4 pt-6 md:pt-10 md:px-8 space-y-10 overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-[-120px] right-[-80px] w-[400px] h-[400px] bg-[#10B981]/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="animate-fade-up">
        <p className="text-[10px] tracking-[0.2em] font-semibold text-[#71717A] uppercase mb-1.5">
          {getHourGreeting()}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#FAFAFA]">
          {gym.name}
        </h1>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-up [animation-delay:0.1s]">
        {[
          { label: "Total Members", value: stats.total, sub: "registered", icon: Users, color: "text-[#10B981]", bg: "bg-[#10B981]/10", stripe: "bg-[#10B981]" },
          { label: "Active Now", value: stats.active, sub: "currently active", icon: UserCheck, color: "text-[#10B981]", bg: "bg-[#10B981]/10", stripe: "bg-[#10B981]" },
          { label: "Expiring Soon", value: stats.expiring, sub: "need renewal", icon: UserMinus, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", stripe: "bg-[#F59E0B]" },
          { label: "Pending Dues", value: formatINR(stats.dues), sub: "outstanding", icon: AlertCircle, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", stripe: "bg-[#EF4444]", valueColor: "text-[#F59E0B]" },
        ].map((stat) => (
          <div key={stat.label} className="card p-5 group relative overflow-hidden hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/20">
            {/* Top accent stripe */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] ${stat.stripe} opacity-60`} />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`h-7 w-7 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={14} strokeWidth={2.5} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className={`text-3xl font-bold tracking-tighter tabular-nums ${stat.valueColor || "text-[#FAFAFA]"}`}>
                {stat.value}
              </h3>
              <p className="text-[11px] text-[#71717A] mt-1 font-medium">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4 animate-fade-up [animation-delay:0.2s]">
        <p className="text-[10px] font-semibold text-[#71717A] tracking-[0.2em] uppercase px-1">
          Quick Actions
        </p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {[
            { label: "Add Member", icon: Plus, href: "/members" },
            { label: "Record Check-in", icon: Zap, href: "/members" },
            { label: "Check Dues", icon: TrendingUp, href: "/reports" },
            { label: "Send Reminders", icon: Bell, href: "/reminders" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-2 h-10 px-4 bg-[#18181B] border border-white/[0.07] rounded-xl text-xs font-medium text-[#A1A1AA] hover:border-[#10B981]/30 hover:text-[#FAFAFA] hover:bg-[#27272A] transition-all shrink-0 group"
            >
              <action.icon size={13} className="text-[#10B981] group-hover:text-[#34D399] transition-colors" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 md:gap-10">
        {/* Needs Attention */}
        <div className="space-y-4 animate-fade-up [animation-delay:0.3s]">
          <div className="flex items-center gap-2.5 px-1">
            <div className="h-2 w-2 rounded-full bg-[#F59E0B]" />
            <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#71717A]">
              Needs Attention
            </h2>
          </div>
          
          <div className="space-y-2">
            {expiringSoon.length === 0 ? (
              <div className="card p-4 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <p className="text-sm text-[#A1A1AA]">All clear — no reminders due today</p>
              </div>
            ) : (
              expiringSoon.slice(0, 5).map((m) => (
                <div key={m.id} className="card p-3.5 hover:border-[#F59E0B]/20 group transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#F59E0B] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#FAFAFA] truncate">{m.full_name}</p>
                      <p className="text-xs text-[#71717A]">Expiring in {m.days_until_expiry} days</p>
                    </div>
                    <Link
                      href="/reminders"
                      className="bg-[#10B981]/10 text-[#10B981] rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[#10B981]/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      Remind
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Activity */}
        <div className="space-y-4 animate-fade-up [animation-delay:0.4s]">
          <div className="flex items-center gap-2.5 px-1">
            <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#71717A]">
              Live Activity
            </h2>
          </div>
          
          <div className="space-y-2">
            {recentCheckins.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-sm text-[#A1A1AA]">Waiting for check-ins...</p>
              </div>
            ) : (
              recentCheckins.slice(0, 6).map((a) => (
                <div key={a.id} className="card p-3 flex items-center gap-3 hover:bg-[#27272A] transition-colors">
                  <MemberAvatar name={a.members.full_name} memberId={a.members.id} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#FAFAFA] truncate">
                      {a.members.full_name}
                    </p>
                    <p className="text-[11px] text-[#71717A] font-mono">
                      Checked in at {new Date(a.checked_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-[#71717A]" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
