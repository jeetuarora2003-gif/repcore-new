"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Phone, Users, ChevronRight } from "lucide-react";
import { formatINR, formatDate, statusLabel, statusBadgeClass, cleanPhone } from "@/lib/helpers";
import type { MemberStatus } from "@/lib/supabase/types";
import type { MemberStatusType } from "@/lib/helpers";
import MemberAvatar from "@/components/MemberAvatar";
import BottomSheet from "@/components/BottomSheet";
import EmptyState from "@/components/EmptyState";
import { createMember } from "@/app/actions/members";
import { toast } from "sonner";

type FilterType = "all" | "active" | "expiring_soon" | "expired" | "lapsed" | "has_dues";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "expiring_soon", label: "Expiring" },
  { key: "expired", label: "Expired" },
  { key: "lapsed", label: "Lapsed" },
  { key: "has_dues", label: "Has Dues" },
];

interface Props {
  gymId: string;
  members: MemberStatus[];
}

export default function MembersClient({ gymId, members }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", joining_date: new Date().toISOString().split("T")[0], notes: ""
  });

  const filtered = members.filter(m => {
    const matchSearch = m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search);
    const matchFilter =
      filter === "all" ? true :
      filter === "has_dues" ? (m.balance_due ?? 0) > 0 :
      m.status === filter;
    return matchSearch && matchFilter;
  });

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createMember({ ...form, gym_id: gymId });
        toast.success("Member added successfully");
        setShowAdd(false);
        setForm({ full_name: "", phone: "", email: "", joining_date: new Date().toISOString().split("T")[0], notes: "" });
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <div className="pb-24 min-h-screen bg-[#080810]">
      {/* Search & Filters Header */}
      <div className="sticky top-[48px] z-20 bg-[#080810]/95 backdrop-blur-md border-b border-white/5 px-4 py-5 md:px-8 space-y-5">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full h-10 rounded-xl bg-surface border border-white/8 pl-11 pr-4 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1]/40 focus:ring-4 focus:ring-[#6366F1]/5 transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`h-8 px-4 rounded-lg text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all border ${
                filter === key
                  ? "bg-[#6366F1]/15 text-[#6366F1] border-[#6366F1]/30"
                  : "bg-surface text-[#94A3B8] border-white/6 hover:text-[#F8FAFC] hover:border-white/12"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Member List */}
      <div className="px-4 py-6 md:px-8 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            message={search ? "No members match your search" : "No members yet. Add your first member!"}
            actionLabel="Add Member"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          filtered.map(m => (
            <Link
              key={m.id}
              href={`/members/${m.id}`}
              className="card block p-4 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-black/20 transition-all active:scale-[0.995]"
            >
              <div className="flex items-center gap-4">
                <MemberAvatar name={m.full_name} memberId={m.id} size="md" status={m.status} rounded="xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="text-[15px] font-semibold text-[#F8FAFC] tracking-tight truncate">{m.full_name}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium tracking-tight shrink-0 ${statusBadgeClass(m.status as MemberStatusType)}`}>
                      {statusLabel(m.status as MemberStatusType)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="text-[12px] text-[#475569] flex items-center gap-1.5 font-mono">
                      <Phone size={12} strokeWidth={1.5} />
                      {m.phone}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">Plan</span>
                      <span className="text-[12px] text-[#94A3B8]">{m.plan_name ?? "No plan"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {(m.balance_due ?? 0) > 0 && (
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider mb-0.5">Dues</p>
                      <p className="text-[13px] font-bold text-[#EF4444] font-mono tabular-nums">
                        {formatINR(m.balance_due!)}
                      </p>
                    </div>
                  )}
                  <ChevronRight size={16} className="text-[#475569]" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-30 h-12 w-12 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-lg shadow-[#6366F1]/30 hover:shadow-[#6366F1]/50 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Add Member Sheet */}
      <BottomSheet open={showAdd} onClose={() => setShowAdd(false)} title="Add New Member">
        <form onSubmit={handleAddSubmit} className="space-y-5 pt-4 pb-10">
          <div className="grid gap-5">
            {[
              { field: "full_name", label: "Full Name", placeholder: "John Smith", type: "text", required: true },
              { field: "phone", label: "Phone Number", placeholder: "98765 43210", type: "tel", required: true },
              { field: "email", label: "Email Address", placeholder: "john@example.com", type: "email", required: false },
            ].map(({ field, label, placeholder, type, required }) => (
              <div key={field}>
                <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">{label}</label>
                <input
                  type={type}
                  required={required}
                  value={form[field as keyof typeof form]}
                  onChange={e => {
                    const val = e.target.value;
                    setForm(p => ({ ...p, [field]: field === "phone" ? cleanPhone(val) : val }));
                  }}
                  placeholder={placeholder}
                  className="w-full h-11 rounded-xl bg-[#080810] border border-white/8 px-4 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1]/40 focus:ring-4 focus:ring-[#6366F1]/5 transition-all"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">Joining Date</label>
            <input
              type="date"
              required
              value={form.joining_date}
              onChange={e => setForm(p => ({ ...p, joining_date: e.target.value }))}
              className="w-full h-11 rounded-xl bg-[#080810] border border-white/8 px-4 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]/40 focus:ring-4 focus:ring-[#6366F1]/5 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-[#6366F1] text-white text-sm font-semibold shadow-lg shadow-[#6366F1]/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {isPending ? "Creating member..." : "Add Member"}
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
