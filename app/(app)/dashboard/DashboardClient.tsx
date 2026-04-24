"use client";

import Link from "next/link";
import { Suspense, use, useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Plus,
  TrendingUp,
  UserCheck,
  UserMinus,
  Users,
  Zap,
} from "lucide-react";
import { formatINR, getHourGreeting } from "@/lib/helpers";
import type { Attendance, Gym, MemberStatus } from "@/lib/supabase/types";
import MemberAvatar from "@/components/MemberAvatar";

type StatsType = {
  total: number;
  active: number;
  expiring: number;
  dues: number;
  newThisMonth: number;
  todayRevenue: number;
};

type RecentCheckinType = Pick<Attendance, "id" | "checked_in_at"> & {
  members: { id: string; full_name: string; photo_url: string | null } | null;
};

interface Props {
  gym: Gym;
  statsPromise: Promise<StatsType>;
  recentCheckinsPromise: Promise<RecentCheckinType[]>;
  expiringSoonPromise: Promise<MemberStatus[]>;
}

export default function DashboardClient({ gym, statsPromise, recentCheckinsPromise, expiringSoonPromise }: Props) {
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setGreeting(getHourGreeting(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-10">
      <div className="animate-fade-up">
        <p className="text-[10px] tracking-[0.2em] font-bold text-text-muted uppercase mb-1.5">{greeting}</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">{gym.name}</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your gym operations and member growth</p>
      </div>

      <Suspense fallback={<StatsGridSkeleton />}>
        <StatsGrid statsPromise={statsPromise} />
      </Suspense>

      <Suspense fallback={<SummarySkeleton />}>
        <Summary statsPromise={statsPromise} recentCheckinsPromise={recentCheckinsPromise} />
      </Suspense>

      <div className="space-y-4 animate-fade-up [animation-delay:0.3s]">
        <p className="text-[10px] font-bold text-text-muted tracking-[0.2em] uppercase px-1">Quick Actions</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {[
            { label: "Add Member", icon: Plus, href: "/members" },
            { label: "Add Plan", icon: Dumbbell, href: "/plans" },
            { label: "Record Check-in", icon: Zap, href: "/checkin" },
            { label: "Check Dues", icon: TrendingUp, href: "/dues" },
            { label: "Send Reminders", icon: Bell, href: "/reminders" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-2.5 h-11 px-6 bg-white border border-border rounded-full text-sm font-semibold text-text-primary hover:bg-hover hover:border-border-strong transition-all shrink-0 active:scale-95"
            >
              <action.icon size={16} className="text-accent" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4 animate-fade-up [animation-delay:0.4s]">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-status-warning-text" />
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted">Needs Attention</h2>
            </div>
            <Link href="/reminders" className="text-[10px] font-bold text-accent hover:underline uppercase tracking-wider">
              View All
            </Link>
          </div>

          <Suspense fallback={<ListSkeleton />}>
            <ExpiringList expiringSoonPromise={expiringSoonPromise} />
          </Suspense>
        </div>

        <div className="space-y-4 animate-fade-up [animation-delay:0.5s]">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted">Live Check-ins</h2>
            </div>
            <Link href="/reports" className="text-[10px] font-bold text-accent hover:underline uppercase tracking-wider">
              Full Log
            </Link>
          </div>

          <Suspense fallback={<ListSkeleton />}>
            <RecentCheckinsList recentCheckinsPromise={recentCheckinsPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ statsPromise }: { statsPromise: Promise<StatsType> }) {
  const stats = use(statsPromise);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {[
        {
          label: "Total Members",
          value: stats.total,
          sub: "registered",
          icon: Users,
          accent: "border-t-[#1A7A5E]",
          valColor: "text-text-primary",
          href: "/members",
        },
        {
          label: "Active Now",
          value: stats.active,
          sub: "currently active",
          icon: UserCheck,
          accent: "border-t-[#1A7A5E]",
          valColor: "text-accent-text",
          href: "/members",
        },
        {
          label: "Expiring Soon",
          value: stats.expiring,
          sub: "need renewal",
          icon: UserMinus,
          accent: "border-t-[#B85C00]",
          valColor: "text-status-warning-text",
          href: "/reminders",
        },
        {
          label: "Pending Dues",
          value: formatINR(stats.dues),
          sub: "outstanding",
          icon: AlertCircle,
          accent: "border-t-[#C0392B]",
          valColor: "text-status-danger-text",
          href: "/dues",
        },
      ].map((stat, index) => (
        <Link
          key={stat.label}
          href={stat.href}
          className={`bg-white border border-border rounded-xl p-5 border-t-[3px] ${stat.accent} animate-fade-up transition-colors hover:border-border-strong cursor-pointer`}
          style={{ animationDelay: `${100 + index * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{stat.label}</span>
            <stat.icon size={16} className="text-text-muted" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-3xl font-bold tracking-tight font-mono ${stat.valColor}`}>{stat.value}</h3>
              {stat.label === "Total Members" && stats.newThisMonth > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 animate-fade-in">
                  <TrendingUp size={10} className="text-accent" />
                  <span className="text-[10px] font-bold text-accent">{stats.newThisMonth} new</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-wider">{stat.sub}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Summary({ statsPromise, recentCheckinsPromise }: { statsPromise: Promise<StatsType>, recentCheckinsPromise: Promise<RecentCheckinType[]> }) {
  const stats = use(statsPromise);
  const recentCheckins = use(recentCheckinsPromise);

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden animate-fade-up [animation-delay:0.2s]">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="p-5 space-y-1">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Today&apos;s Check-ins</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold font-mono text-accent">{recentCheckins.length}</span>
            <span className="text-[10px] text-accent-text font-bold mb-1.5 uppercase tracking-wide">Members</span>
          </div>
        </div>
        <div className="p-5 space-y-1">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Revenue Collected</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold font-mono text-text-primary">{formatINR(stats.todayRevenue)}</span>
            <span className="text-[10px] text-status-success-text font-bold mb-1.5 uppercase tracking-wide">Today</span>
          </div>
        </div>
        <div className="p-5 space-y-1">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">New Members</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold font-mono text-text-primary">{stats.newThisMonth}</span>
            <span className="text-[10px] text-text-secondary font-bold mb-1.5 uppercase tracking-wide">Joinings</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpiringList({ expiringSoonPromise }: { expiringSoonPromise: Promise<MemberStatus[]> }) {
  const expiringSoon = use(expiringSoonPromise);

  return (
    <div className="bg-white border border-border rounded-xl divide-y divide-border overflow-hidden">
      {expiringSoon.length === 0 ? (
        <div className="p-8 text-center">
          <CheckCircle2 size={32} className="mx-auto text-status-success-text mb-3 opacity-20" />
          <p className="text-sm font-medium text-text-secondary">All clear - no reminders due today</p>
        </div>
      ) : (
        expiringSoon.slice(0, 5).map((member) => (
          <div key={member.id} className="p-4 hover:bg-hover transition-colors group">
            <div className="flex items-center gap-4">
              <MemberAvatar
                name={member.full_name}
                memberId={member.id}
                photoUrl={member.photo_url}
                size="md"
                rounded="full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">{member.full_name}</p>
                <p className="text-xs text-text-muted">Expiring in {member.days_until_expiry} days</p>
              </div>
              <Link
                href="/reminders"
                className="bg-accent text-white rounded-lg px-4 py-2 text-xs font-bold hover:bg-accent-hover transition-all opacity-0 group-hover:opacity-100 shadow-sm"
              >
                Remind
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function RecentCheckinsList({ recentCheckinsPromise }: { recentCheckinsPromise: Promise<RecentCheckinType[]> }) {
  const recentCheckins = use(recentCheckinsPromise);

  return (
    <div className="bg-white border border-border rounded-xl divide-y divide-border overflow-hidden">
      {recentCheckins.length === 0 ? (
        <div className="p-8 text-center">
          <Clock size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
          <p className="text-sm font-medium text-text-secondary">Waiting for check-ins...</p>
        </div>
      ) : (
        recentCheckins
          .filter((checkin) => checkin.members)
          .slice(0, 6)
          .map((checkin) => (
            <div key={checkin.id} className="p-4 flex items-center gap-4 hover:bg-hover transition-colors">
              <MemberAvatar
                name={checkin.members!.full_name}
                memberId={checkin.members!.id}
                photoUrl={checkin.members!.photo_url}
                size="md"
                rounded="full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">{checkin.members!.full_name}</p>
                <p className="text-[11px] text-text-muted font-mono font-medium">
                  Checked in at {new Date(checkin.checked_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <ChevronRight size={16} className="text-text-muted" />
            </div>
          ))
      )}
    </div>
  );
}

function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-border rounded-xl p-5 h-32" />
      ))}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden h-28 animate-pulse" />
  );
}

function ListSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl divide-y divide-border overflow-hidden animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 flex items-center gap-4 h-16" />
      ))}
    </div>
  );
}
