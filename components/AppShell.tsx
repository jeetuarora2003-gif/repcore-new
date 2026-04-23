"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Users, Bell, 
  Settings, LayoutGrid, Dumbbell,
  MoreHorizontal, ScanLine, ChevronRight
} from "lucide-react";
import type { Gym } from "@/lib/supabase/types";
import { memberInitials } from "@/lib/helpers";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Members", href: "/members", icon: Users },
  { label: "Reminders", href: "/reminders", icon: Bell },
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
        <header className="sticky top-0 z-40 bg-white border-b border-border flex items-center justify-between px-6 md:px-8 h-14">
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
        <main className="flex-1 px-6 py-6 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex items-center justify-around px-2 z-40 h-16 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        {[
          { label: "Home", href: "/dashboard", icon: Home },
          { label: "Members", href: "/members", icon: Users },
          { label: "Check-in", href: "/members", icon: ScanLine, special: true },
          { label: "Reminders", href: "/reminders", icon: Bell },
          { label: "More", href: "/settings", icon: MoreHorizontal },
        ].map((item) => {
          const active = pathname === item.href;
          if (item.special) {
            return (
              <Link
                key="checkin-special"
                href={item.href}
                className="flex flex-col items-center justify-center -mt-8 h-12 w-12 bg-accent rounded-xl text-white shadow-[0_4px_16px_rgba(26,122,94,0.4)] active:scale-95 transition-all"
              >
                <item.icon size={22} strokeWidth={2.5} />
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 min-w-[60px] transition-all active:scale-95 ${
                active ? "text-accent" : "text-text-muted"
              }`}
            >
              <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
