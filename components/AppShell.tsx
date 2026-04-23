"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ScanLine,
  Bell,
  MoreHorizontal,
  Dumbbell,
  BarChart2,
  ClipboardList,
  Settings,
} from "lucide-react";
import type { Gym } from "@/lib/supabase/types";
import { memberInitials } from "@/lib/helpers";

interface Props {
  gym: Gym;
  children: React.ReactNode;
}

const TAB_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/members", icon: Users, label: "Members" },
  { href: "/checkin", icon: ScanLine, label: "Check-in", accent: true },
  { href: "/reminders", icon: Bell, label: "Reminders" },
  { href: "/more", icon: MoreHorizontal, label: "More" },
];

const SIDEBAR_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/members", icon: Users, label: "Members" },
  { href: "/checkin", icon: ScanLine, label: "Check-in" },
  { href: "/reminders", icon: Bell, label: "Reminders" },
  { href: "/plans", icon: ClipboardList, label: "Plans" },
  { href: "/reports", icon: BarChart2, label: "Reports" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function AppShell({ gym, children }: Props) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0D0D14] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#13131F] border-r border-[#1E1E30] fixed left-0 top-0 h-screen z-30">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#1E1E30]">
          <div className="h-8 w-8 rounded-xl bg-[#6366F1] flex items-center justify-center shrink-0">
            <Dumbbell size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold">
            <span className="text-[#6366F1]">Rep</span>
            <span className="text-[#F1F5F9]">Core</span>
          </span>
        </div>

        {/* Gym info */}
        <div className="px-5 py-3 border-b border-[#1E1E30]">
          <p className="text-xs text-[#94A3B8] mb-0.5">Managing</p>
          <p className="text-sm font-semibold text-[#F1F5F9] truncate">{gym.name}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#6366F1]/15 text-[#6366F1]"
                    : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1C1C2E]"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-[#1E1E30]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-xs font-semibold">
              {memberInitials(gym.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#F1F5F9] truncate">{gym.name}</p>
              <Link href="/settings" className="text-xs text-[#94A3B8] hover:text-[#6366F1]">Settings</Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-w-0 overflow-y-auto min-h-screen">
        <div className="max-w-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="pb-20 md:pb-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#1C1C2E]/90 backdrop-blur-lg border-t border-[#1E1E30] h-16 flex items-center">
        {TAB_ITEMS.map(({ href, icon: Icon, label, accent }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const moreActive = href === "/more" && ["/plans", "/reports", "/settings"].some(p => pathname.startsWith(p));

          return (
            <Link
              key={href}
              href={href === "/more" ? "/plans" : href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
                accent
                  ? "relative"
                  : active || moreActive
                  ? "text-[#6366F1]"
                  : "text-[#94A3B8]"
              }`}
            >
              {accent ? (
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-colors ${active ? "bg-[#6366F1]" : "bg-[#6366F1]/80"}`}>
                  <Icon size={22} className="text-white" />
                </div>
              ) : (
                <>
                  <Icon size={20} />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
