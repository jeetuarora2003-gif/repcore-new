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
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-gradient-to-b from-[#0D0D14] to-[#111120] border-r border-white/5 fixed left-0 top-0 h-screen z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-7 border-b border-white/5">
          <div className="relative">
            <div className="h-2 w-2 rounded-full bg-[#6366F1] animate-pulse" />
            <div className="absolute inset-0 h-2 w-2 rounded-full bg-[#6366F1] blur-md" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-[#6366F1]">Rep</span>
            <span className="text-white">Core</span>
          </span>
        </div>

        {/* Gym info */}
        <div className="px-6 py-5">
          <p className="text-[10px] uppercase tracking-wider font-bold text-[#94A3B8] mb-1">Managing</p>
          <p className="text-sm font-semibold text-white truncate">{gym.name}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <motion.div
                key={href}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  href={href}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                    active
                      ? "text-white bg-gradient-to-r from-[#6366F1]/20 to-transparent border-l-2 border-[#6366F1]"
                      : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-[#6366F1]/5 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon size={18} className={`${active ? "text-[#6366F1]" : "group-hover:text-white"}`} />
                  {label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="px-4 py-6 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-white/5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-[#6366F1]/20">
              {memberInitials(gym.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{gym.name}</p>
              <Link href="/settings" className="text-[11px] font-medium text-[#94A3B8] hover:text-[#6366F1] transition-colors">
                View Settings
              </Link>
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0D0D14]/80 backdrop-blur-xl border-t border-white/5 h-16 flex items-center px-4">
        {TAB_ITEMS.map(({ href, icon: Icon, label, accent }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const moreActive = href === "/more" && ["/plans", "/reports", "/settings"].some(p => pathname.startsWith(p));

          return (
            <Link
              key={href}
              href={href === "/more" ? "/plans" : href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all ${
                accent
                  ? "relative"
                  : active || moreActive
                  ? "text-[#6366F1]"
                  : "text-[#94A3B8]"
              }`}
            >
              {accent ? (
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all ${active ? "bg-[#6366F1] shadow-lg shadow-[#6366F1]/30" : "bg-[#6366F1]/80"}`}>
                  <Icon size={22} className="text-white" />
                </div>
              ) : (
                <>
                  <Icon size={20} className={active || moreActive ? "scale-110" : ""} />
                  <span className="text-[10px] font-semibold">{label}</span>
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
