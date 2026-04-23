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
    <div className="flex min-h-screen bg-[#080810]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-56 flex-col fixed inset-y-0 left-0 bg-gradient-to-b from-[#0A0A18] to-[#080810] border-r border-white/5 z-30">
        {/* Top Section */}
        <div className="p-4 pb-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-7 w-7 rounded-lg bg-[#6366F1] flex items-center justify-center shadow-lg shadow-[#6366F1]/20 transition-transform group-hover:scale-105">
              <Dumbbell size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">RepCore</span>
          </Link>
          
          <div className="mt-6">
            <p className="text-[10px] font-semibold text-[#475569] uppercase tracking-[0.12em] mb-2">
              Managing
            </p>
            <p className="text-sm font-medium text-[#F8FAFC] truncate">
              {gym.name}
            </p>
          </div>
          <hr className="border-white/5 my-4" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 group ${
                  active 
                    ? "bg-[#6366F1]/10 text-[#6366F1] font-medium" 
                    : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/4"
                }`}
              >
                {active && (
                  <div className="absolute left-0 w-0.5 h-4 bg-[#6366F1] rounded-full" />
                )}
                <item.icon size={15} strokeWidth={1.5} className={active ? "text-[#6366F1]" : "text-[#94A3B8] group-hover:text-[#F8FAFC]"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto p-3">
          <Link
            href="/settings"
            className={`flex items-center gap-2.5 p-2.5 rounded-xl bg-white/3 border border-white/6 hover:border-white/12 transition-all ${
              pathname === "/settings" ? "border-[#6366F1]/30" : ""
            }`}
          >
            <div className="h-7 w-7 rounded-lg bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] font-bold text-[10px]">
              {memberInitials(gym.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#F8FAFC] truncate">{gym.name}</p>
            </div>
            <Settings size={14} className="text-[#94A3B8]" />
          </Link>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 md:ml-56 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-[48px] bg-[#080810]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-8">
          <h2 className="text-sm font-semibold text-[#F8FAFC] tracking-tight">
            {getPageTitle()}
          </h2>
          <div className="h-8 w-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-[11px] font-semibold border border-white/10 shadow-lg shadow-[#6366F1]/20">
            {memberInitials(gym.name)}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-16 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#080810]/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-2 z-40 pb-safe">
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
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 h-12 w-12 bg-[#6366F1] rounded-xl text-white shadow-lg shadow-[#6366F1]/30 active:scale-90 transition-all"
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
                active ? "text-[#6366F1]" : "text-[#475569]"
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
