"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Phone, Users, ChevronRight, Filter } from "lucide-react";
import { formatINR, statusLabel, statusBadgeClass } from "@/lib/helpers";
import type { MemberStatus } from "@/lib/supabase/types";
import type { MemberStatusType } from "@/lib/helpers";
import MemberAvatar from "@/components/MemberAvatar";
import EmptyState from "@/components/EmptyState";
import AddMemberWizard from "@/components/AddMemberWizard";

type FilterType = "all" | "active" | "expiring_soon" | "expired" | "lapsed" | "has_dues";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All Members" },
  { key: "active", label: "Active" },
  { key: "expiring_soon", label: "Expiring" },
  { key: "expired", label: "Expired" },
  { key: "lapsed", label: "Lapsed" },
  { key: "has_dues", label: "With Dues" },
];

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
}

interface Props {
  gymId: string;
  members: Pick<MemberStatus, "id" | "full_name" | "phone" | "photo_url" | "plan_name" | "balance_due" | "status">[];
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
    <div className="space-y-6 animate-fade-up">
      {/* Header & Search */}
      <div className="sticky top-[56px] z-20 -mx-6 px-6 py-4 bg-page/80 backdrop-blur-md border-b border-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full h-12 rounded-xl bg-white border border-border pl-12 pr-4 text-sm text-text-primary font-semibold placeholder-text-muted focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="h-12 px-6 rounded-full bg-accent text-white flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest shadow-lg shadow-accent/20 active:scale-95 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            Add Member
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest mr-2">
            <Filter size={14} />
            Filters:
          </div>
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`h-9 px-4 rounded-full text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                filter === key
                  ? "bg-accent text-white border-accent shadow-sm"
                  : "bg-white text-text-muted border-border hover:border-border-strong"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Member List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-20">
            <EmptyState icon={Users} message={search ? "No members match your search" : "No members found"} actionLabel="Add Member" onAction={() => setShowAdd(true)} />
          </div>
        ) : (
          filtered.map(m => (
            <Link key={m.id} href={`/members/${m.id}`} className="block group">
              <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-4 hover:border-border-strong transition-all active:scale-[0.995] shadow-sm">
                <MemberAvatar name={m.full_name} memberId={m.id} photoUrl={m.photo_url} size="md" status={m.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="text-[15px] font-bold text-text-primary tracking-tight truncate group-hover:text-accent transition-colors">{m.full_name}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${statusBadgeClass(m.status as MemberStatusType)}`}>
                      {statusLabel(m.status as MemberStatusType)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <p className="text-[12px] font-bold text-text-secondary flex items-center gap-2 font-mono">
                      <Phone size={12} className="text-text-muted" />
                      {m.phone}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Plan:</span>
                      <span className="text-[12px] font-bold text-text-secondary">{m.plan_name ?? "No plan"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col items-end gap-1">
                    {(m.balance_due ?? 0) > 0 && (
                      <span className="text-[10px] font-bold text-status-danger-text bg-status-danger-bg border border-status-danger-border px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Due: {formatINR(m.balance_due)}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-text-muted group-hover:text-accent transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <AddMemberWizard 
        isOpen={showAdd} 
        onClose={() => setShowAdd(false)} 
        gymId={gymId} 
        plans={plans} 
      />
    </div>
  );
}
