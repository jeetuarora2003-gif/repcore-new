"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Users, Bell, 
  Settings, LayoutGrid, Dumbbell,
  MoreHorizontal, ScanLine, Plus, Sparkles
} from "lucide-react";
import type { Gym } from "@/lib/supabase/types";
import { memberInitials } from "@/lib/helpers";
import { preload } from "swr";
import { swrFetcher } from "@/lib/swr-fetcher";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Members", href: "/members", icon: Users },
  { label: "Reminders", href: "/reminders", icon: Bell },
  { label: "Plans", href: "/plans", icon: Dumbbell },
  { label: "Reports", href: "/reports", icon: LayoutGrid },
];

interface Props {
  gym: Gym;
  children: React.ReactNode;
}

export default function AppShell({ gym, children }: Props) {
  const pathname = usePathname();

  const getPageTitle = () => {
    const item = NAV_ITEMS.find(i => i.href === pathname) || { label: "Dashboard" };
    if (pathname === "/settings") return "Settings";
    if (pathname.includes("/members/")) return "Member Profile";
    return item.label;
  };

  return (
    <div className="flex min-h-screen bg-page">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-[240px] flex-col fixed inset-y-0 left-0 bg-sidebar border-r border-sidebar-border z-30">
        {/* Top Section */}
        <div className="p-5 pb-4">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-xl bg-accent flex items-center justify-center shadow-[0_4px_14px_rgba(26,122,94,0.3)] transition-all group-hover:scale-105 group-active:scale-95 duration-300">
              <Dumbbell size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight">
              <span className="text-white">Rep</span>
              <span className="text-accent">Core</span>
            </span>
          </Link>
          
          <div className="mt-8 px-1">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.2em] mb-1.5">
              Workspace
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(26,122,94,0.8)]" />
              <p className="text-sm font-semibold text-white truncate">
                {gym.name}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => {
                  if (item.href === "/dashboard") preload("/api/dashboard", swrFetcher);
                  if (item.href === "/members") preload("/api/members", swrFetcher);
                  if (item.href === "/reminders") preload("/api/reminders", swrFetcher);
                  if (item.href === "/plans") preload("/api/plans", swrFetcher);
                  if (item.href === "/reports") preload("/api/reports", swrFetcher);
                }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                  active 
                    ? "bg-sidebar-active text-white font-semibold" 
                    : "text-text-muted hover:text-white hover:bg-sidebar-hover"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-1/2 bg-accent rounded-r-full shadow-[0_0_10px_rgba(26,122,94,0.6)]" />
                )}
                <item.icon size={16} strokeWidth={active ? 2.5 : 2} className={active ? "text-accent" : "text-text-muted group-hover:text-white transition-colors duration-200"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto p-4">
          <Link
            href="/settings"
            className={`flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-hover transition-all duration-200 group ${
              pathname === "/settings" ? "bg-sidebar-hover" : ""
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-sidebar-hover border border-white/[0.05] flex items-center justify-center text-white font-bold text-xs group-hover:border-accent/30 transition-colors">
              {memberInitials(gym.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{gym.name}</p>
              <p className="text-[10px] text-text-muted mt-0.5">Settings & Billing</p>
            </div>
            <Settings size={14} className="text-text-muted group-hover:rotate-45 transition-transform duration-500" />
          </Link>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 md:ml-[240px] flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="fixed top-0 right-0 left-0 md:left-[240px] z-40 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 md:px-8 h-14">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-text-primary tracking-tight">
              {getPageTitle()}
            </h2>
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">RepCore Management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-1">
              <p className="text-[11px] font-bold text-text-primary uppercase tracking-wider">{gym.name}</p>
              <p className="text-[10px] text-text-muted">Administrator</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white text-[11px] font-bold shadow-[0_4px_10px_rgba(26,122,94,0.3)]">
              {memberInitials(gym.name)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 py-6 pt-20 pb-32 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-border flex items-center justify-around px-2 z-40 h-[80px] pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_40px_rgba(0,0,0,0.08)]">
        {[
          { label: "Home", href: "/dashboard", icon: Home },
          { label: "Members", href: "/members", icon: Users },
          { label: "Add", href: "/members?add=true", icon: Plus, special: true },
          { label: "Reminders", href: "/reminders", icon: Bell },
          { label: "Plans", href: "/plans", icon: Sparkles },
        ].map((item) => {
          const active = pathname === item.href;
          if (item.special) {
            return (
              <Link
                key="add-special"
                href={item.href}
                className="flex flex-col items-center justify-center -mt-12 h-14 w-14 bg-accent rounded-full text-white shadow-[0_12px_24px_rgba(26,122,94,0.4)] active:scale-90 transition-all border-[6px] border-page"
              >
                <item.icon size={28} strokeWidth={3} />
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              onTouchStart={() => {
                // Only preload if they touch for a split second (prevent flooding while scrolling)
                const timer = setTimeout(() => {
                  if (item.href === "/dashboard") preload("/api/dashboard", swrFetcher);
                  if (item.href === "/members") preload("/api/members", swrFetcher);
                  if (item.href === "/reminders") preload("/api/reminders", swrFetcher);
                  if (item.href === "/plans") preload("/api/plans", swrFetcher);
                }, 80);
                (window as any)._prefetchTimer = timer;
              }}
              onTouchEnd={() => {
                if ((window as any)._prefetchTimer) clearTimeout((window as any)._prefetchTimer);
              }}
              className={`flex flex-col items-center justify-center gap-1 min-w-[60px] h-full transition-all active:scale-90 ${
                active ? "text-accent" : "text-text-muted"
              }`}
            >
              <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[9px] font-bold uppercase tracking-tight ${active ? "opacity-100" : "opacity-60"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
