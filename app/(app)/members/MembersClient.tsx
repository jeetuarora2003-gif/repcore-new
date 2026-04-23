"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Phone, Users } from "lucide-react";
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
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0D0D14]/95 backdrop-blur-md border-b border-[#1E1E30] px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-[#F1F5F9]">Members</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="h-9 w-9 rounded-xl bg-[#6366F1] flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] pl-9 pr-4 text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] transition-colors text-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === key
                ? "bg-[#6366F1] text-white"
                : "bg-[#1C1C2E] text-[#94A3B8] border border-[#1E1E30] hover:text-[#F1F5F9]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Member List */}
      <div className="px-4 space-y-2">
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
              className="block premium-card p-4 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <MemberAvatar name={m.full_name} memberId={m.id} size="md" status={m.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[#F1F5F9] truncate">{m.full_name}</p>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${statusBadgeClass(m.status as MemberStatusType)}`}>
                      {statusLabel(m.status as MemberStatusType)}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] flex items-center gap-1">
                    <Phone size={10} />
                    {m.phone}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[#94A3B8]">
                    <span>{m.plan_name ?? "No plan"}</span>
                    {m.end_date && (
                      <span>· Expires {formatDate(m.end_date)}</span>
                    )}
                  </div>
                </div>
                {(m.balance_due ?? 0) > 0 && (
                  <span className="text-xs font-semibold text-[#EF4444] shrink-0">
                    {formatINR(m.balance_due)}
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="md:hidden fixed bottom-20 right-4 z-20 h-14 w-14 rounded-full bg-[#6366F1] flex items-center justify-center text-white active:scale-95 transition-all duration-200 primary-button"
      >
        <Plus size={24} />
      </button>

      {/* Add Member Sheet */}
      <BottomSheet open={showAdd} onClose={() => setShowAdd(false)} title="Add Member">
        <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
          {[
            { field: "full_name", label: "Full Name", placeholder: "John Smith", type: "text", required: true },
            { field: "phone", label: "Phone", placeholder: "+91 98765 43210", type: "tel", required: true },
            { field: "email", label: "Email", placeholder: "john@example.com", type: "email", required: false },
          ].map(({ field, label, placeholder, type, required }) => (
            <div key={field}>
              <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">{label}</label>
              <input
                type={type}
                required={required}
                value={form[field as keyof typeof form]}
                onChange={e => {
                  const val = e.target.value;
                  setForm(p => ({ ...p, [field]: field === "phone" ? cleanPhone(val) : val }));
                }}
                placeholder={placeholder}
                className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] transition-colors text-sm"
              />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Joining Date</label>
            <input
              type="date"
              required
              value={form.joining_date}
              onChange={e => setForm(p => ({ ...p, joining_date: e.target.value }))}
              className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] transition-colors text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Optional notes..."
              rows={2}
              className="w-full rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 py-3 text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] transition-colors text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-[#6366F1] text-white font-semibold active:scale-95 transition-all duration-200 disabled:opacity-60 primary-button"
          >
            {isPending ? "Adding..." : "Add Member"}
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
