"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Phone, Users, ChevronRight } from "lucide-react";
import { formatINR, statusLabel, statusBadgeClass } from "@/lib/helpers";
import type { MemberStatus } from "@/lib/supabase/types";
import type { MemberStatusType } from "@/lib/helpers";
import MemberAvatar from "@/components/MemberAvatar";
import EmptyState from "@/components/EmptyState";
import AddMemberWizard from "@/components/AddMemberWizard";

type FilterType = "all" | "active" | "expiring_soon" | "expired" | "lapsed" | "has_dues";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "expiring_soon", label: "Expiring" },
  { key: "expired", label: "Expired" },
  { key: "lapsed", label: "Lapsed" },
  { key: "has_dues", label: "Has Dues" },
];

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
}

interface Props {
  gymId: string;
  members: MemberStatus[];
  plans: Plan[];
}

export default function MembersClient({ gymId, members, plans }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = members.filter(m => {
    const matchSearch = m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search);
    const matchFilter =
      filter === "all" ? true :
      filter === "has_dues" ? (m.balance_due ?? 0) > 0 :
      m.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="pb-24 min-h-screen bg-[#09090B]">
      <div className="sticky top-[48px] z-20 glass border-b border-white/[0.05] px-4 py-5 md:px-8 space-y-5">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full h-10 rounded-xl bg-[#27272A] border border-white/[0.08] pl-11 pr-4 text-sm text-[#E4E4E7] placeholder-[#71717A] focus:outline-none focus:border-[#10B981]/40 focus:ring-4 focus:ring-[#10B981]/[0.08] transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`h-8 px-4 rounded-lg text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all border ${
                filter === key
                  ? "bg-[#10B981]/12 text-[#10B981] border-[#10B981]/30"
                  : "bg-[#18181B] text-[#A1A1AA] border-white/[0.07] hover:text-[#E4E4E7] hover:border-white/[0.12]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 md:px-8 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} message={search ? "No members match your search" : "No members yet. Add your first member!"} actionLabel="Add Member" onAction={() => setShowAdd(true)} />
        ) : (
          filtered.map(m => (
            <Link key={m.id} href={`/members/${m.id}`} className="card block p-4 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-black/20 transition-all active:scale-[0.995]">
              <div className="flex items-center gap-4">
                <MemberAvatar name={m.full_name} memberId={m.id} size="md" status={m.status} rounded="xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="text-[15px] font-semibold text-[#E4E4E7] tracking-tight truncate">{m.full_name}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium tracking-tight shrink-0 ${statusBadgeClass(m.status as MemberStatusType)}`}>{statusLabel(m.status as MemberStatusType)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="text-[12px] text-[#71717A] flex items-center gap-1.5 font-mono"><Phone size={12} strokeWidth={1.5} />{m.phone}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">Plan</span>
                      <span className="text-[12px] text-[#A1A1AA]">{m.plan_name ?? "No plan"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1.5">
                    {m.balance_due > 0 && (
                      <span className="text-[10px] font-mono text-[#EF4444] bg-[#EF4444]/10 px-1.5 py-0.5 rounded">
                        DUE {formatINR(m.balance_due)}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-[#3F3F46] group-hover:text-[#10B981] transition-colors shrink-0" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-[84px] md:bottom-8 right-4 md:right-8 h-14 w-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center text-white shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all z-30"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <AddMemberWizard 
        isOpen={showAdd} 
        onClose={() => setShowAdd(false)} 
        gymId={gymId} 
        plans={plans} 
      />
    </div>
  );
}
