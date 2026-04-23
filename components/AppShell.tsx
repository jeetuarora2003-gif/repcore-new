"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Users, Bell, 
  Settings, LayoutGrid, Dumbbell,
  MoreHorizontal, ScanLine
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
    <div className="flex min-h-screen bg-[#09090B]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-[240px] flex-col fixed inset-y-0 left-0 bg-transparent border-r border-white/[0.03] z-30">
        {/* Top Section */}
        <div className="p-5 pb-4">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_2px_10px_rgba(16,185,129,0.2)] transition-transform group-hover:scale-105 group-active:scale-95 duration-300">
              <Dumbbell size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-semibold text-[#E4E4E7] tracking-tight">RepCore</span>
          </Link>
          
          <div className="mt-8 px-1">
            <p className="text-[10px] font-medium text-[#71717A] uppercase tracking-[0.15em] mb-1.5">
              Workspace
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <p className="text-sm font-medium text-[#E4E4E7] truncate">
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
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 group ${
                  active 
                    ? "bg-white/[0.04] text-[#E4E4E7] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]" 
                    : "text-[#71717A] hover:text-[#E4E4E7] hover:bg-white/[0.02]"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-1/2 bg-[#10B981] rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
                <item.icon size={16} strokeWidth={active ? 2 : 1.5} className={active ? "text-[#10B981]" : "text-[#71717A] group-hover:text-[#E4E4E7] transition-colors duration-300"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto p-4">
          <Link
            href="/settings"
            className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all duration-300 group ${
              pathname === "/settings" ? "bg-white/[0.04]" : ""
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-[#18181B] border border-white/[0.05] flex items-center justify-center text-[#E4E4E7] font-medium text-xs group-hover:border-white/[0.1] transition-colors">
              {memberInitials(gym.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#E4E4E7] truncate">{gym.name}</p>
              <p className="text-[10px] text-[#71717A] mt-0.5">Settings & Billing</p>
            </div>
            <Settings size={14} className="text-[#71717A] group-hover:rotate-45 transition-transform duration-500" />
          </Link>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 md:ml-56 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-[48px] glass border-b border-white/[0.05] flex items-center justify-between px-4 md:px-8">
          <h2 className="text-sm font-semibold text-[#E4E4E7] tracking-tight">
            {getPageTitle()}
          </h2>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white text-[11px] font-semibold border border-white/10 shadow-lg shadow-[#10B981]/15">
            {memberInitials(gym.name)}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-16 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 glass border-t border-white/[0.05] flex items-center justify-around px-2 z-40 pb-safe">
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
                className="flex flex-col items-center justify-center -mt-6 h-12 w-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl text-white shadow-lg shadow-[#10B981]/30 active:scale-90 transition-all"
              >
                <item.icon size={22} strokeWidth={2} />
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 min-w-[60px] transition-all active:scale-95 ${
                active ? "text-[#10B981]" : "text-[#71717A]"
              }`}
            >
              <item.icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
