"use client";

import { 
  Users, UserCheck, UserMinus, 
  AlertCircle, Plus, ChevronRight,
  TrendingUp, Calendar, Zap, Bell
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
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-[#6366F1]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="animate-fade-up">
        <p className="text-[10px] tracking-[0.2em] font-semibold text-[#475569] uppercase mb-1.5">
          {getHourGreeting()}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F8FAFC]">
          {gym.name}
        </h1>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-up [animation-delay:0.1s]">
        {[
          { label: "Total Members", value: stats.total, sub: "members total", icon: Users, color: "text-[#6366F1]", bg: "bg-[#6366F1]/10" },
          { label: "Active Now", value: stats.active, sub: "currently active", icon: UserCheck, color: "text-[#10B981]", bg: "bg-[#10B981]/12" },
          { label: "Expiring Soon", value: stats.expiring, sub: "need renewal", icon: UserMinus, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/12" },
          { label: "Pending Dues", value: formatINR(stats.dues), sub: "outstanding", icon: AlertCircle, color: "text-[#EF4444]", bg: "bg-[#EF4444]/12", valueColor: "text-[#EF4444]" },
        ].map((stat) => (
          <div key={stat.label} className="card p-5 group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`h-7 w-7 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={14} strokeWidth={2.5} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className={`text-4xl font-bold tracking-tighter ${stat.valueColor || "text-[#F8FAFC]"}`}>
                {stat.value}
              </h3>
              <p className="text-[11px] text-[#475569] mt-1 font-medium">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4 animate-fade-up [animation-delay:0.2s]">
        <p className="text-[10px] font-semibold text-[#475569] tracking-[0.2em] uppercase px-1">
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
              className="flex items-center gap-2 h-10 px-4 bg-surface border border-white/6 rounded-xl text-xs font-medium text-[#94A3B8] hover:border-white/12 hover:text-[#F8FAFC] hover:bg-surface-2 transition-all shrink-0"
            >
              <action.icon size={13} className="text-[#6366F1]" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 md:gap-10">
        {/* Reminders section */}
        <div className="space-y-4 animate-fade-up [animation-delay:0.3s]">
          <div className="border-l-2 border-[#6366F1] pl-3">
            <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#475569]">
              Needs Attention
            </h2>
          </div>
          
          <div className="space-y-2">
            {expiringSoon.length === 0 ? (
              <div className="card p-4 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <p className="text-sm text-[#94A3B8]">All clear — no reminders due today</p>
              </div>
            ) : (
              expiringSoon.slice(0, 5).map((m) => (
                <div key={m.id} className="card p-3.5 hover:bg-[#F59E0B]/5 hover:border-[#F59E0B]/20 group transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F8FAFC] truncate">{m.full_name}</p>
                      <p className="text-xs text-[#475569]">Expiring in {m.days_until_expiry} days</p>
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

        {/* Recent Attendance */}
        <div className="space-y-4 animate-fade-up [animation-delay:0.4s]">
          <div className="border-l-2 border-[#10B981] pl-3">
            <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#475569]">
              Live Activity
            </h2>
          </div>
          
          <div className="space-y-2">
            {recentCheckins.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-sm text-[#94A3B8]">Waiting for check-ins...</p>
              </div>
            ) : (
              recentCheckins.slice(0, 6).map((a) => (
                <div key={a.id} className="card p-3 flex items-center gap-3">
                  <MemberAvatar name={a.members.full_name} memberId={a.members.id} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F8FAFC] truncate">
                      {a.members.full_name}
                    </p>
                    <p className="text-[11px] text-[#475569] font-mono">
                      Checked in at {new Date(a.checked_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-[#475569]" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
