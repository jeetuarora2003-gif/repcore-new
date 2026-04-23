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
    <div className="pb-24 min-h-screen bg-[#09090B]">
      <div className="sticky top-[48px] z-20 glass border-b border-white/[0.05] px-4 py-5 md:px-8 space-y-5">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full h-10 rounded-xl bg-[#1A1A1F] border border-white/[0.08] pl-11 pr-4 text-sm text-[#FAFAFA] placeholder-[#52525B] focus:outline-none focus:border-[#10B981]/40 focus:ring-4 focus:ring-[#10B981]/[0.08] transition-all"
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
                  : "bg-[#131316] text-[#A1A1AA] border-white/[0.07] hover:text-[#FAFAFA] hover:border-white/[0.12]"
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
                    <p className="text-[15px] font-semibold text-[#FAFAFA] tracking-tight truncate">{m.full_name}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium tracking-tight shrink-0 ${statusBadgeClass(m.status as MemberStatusType)}`}>{statusLabel(m.status as MemberStatusType)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="text-[12px] text-[#52525B] flex items-center gap-1.5 font-mono"><Phone size={12} strokeWidth={1.5} />{m.phone}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-[#52525B] uppercase tracking-wider">Plan</span>
                      <span className="text-[12px] text-[#A1A1AA]">{m.plan_name ?? "No plan"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {(m.balance_due ?? 0) > 0 && (
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-wider mb-0.5">Dues</p>
                      <p className="text-[13px] font-bold text-[#F59E0B] font-mono tabular-nums">{formatINR(m.balance_due!)}</p>
                    </div>
                  )}
                  <ChevronRight size={16} className="text-[#52525B]" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <button onClick={() => setShowAdd(true)} className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-30 h-12 w-12 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white shadow-lg shadow-[#10B981]/30 hover:shadow-[#10B981]/50 hover:scale-105 active:scale-95 transition-all duration-200">
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <BottomSheet open={showAdd} onClose={() => setShowAdd(false)} title="Add New Member">
        <form onSubmit={handleAddSubmit} className="space-y-5 pt-4 pb-10">
          <div className="grid gap-5">
            {[
              { field: "full_name", label: "Full Name", placeholder: "John Smith", type: "text", required: true },
              { field: "phone", label: "Phone Number", placeholder: "98765 43210", type: "tel", required: true },
              { field: "email", label: "Email Address", placeholder: "john@example.com", type: "email", required: false },
            ].map(({ field, label, placeholder, type, required }) => (
              <div key={field}>
                <label className="text-xs font-medium text-[#A1A1AA] block mb-1.5">{label}</label>
                <input type={type} required={required} value={form[field as keyof typeof form]} onChange={e => { const val = e.target.value; setForm(p => ({ ...p, [field]: field === "phone" ? cleanPhone(val) : val })); }} placeholder={placeholder} className="w-full h-11 rounded-xl bg-[#1A1A1F] border border-white/[0.08] px-4 text-sm text-[#FAFAFA] placeholder-[#52525B] focus:outline-none focus:border-[#10B981]/40 focus:ring-4 focus:ring-[#10B981]/[0.08] transition-all" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium text-[#A1A1AA] block mb-1.5">Joining Date</label>
            <input type="date" required value={form.joining_date} onChange={e => setForm(p => ({ ...p, joining_date: e.target.value }))} className="w-full h-11 rounded-xl bg-[#1A1A1F] border border-white/[0.08] px-4 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#10B981]/40 transition-all" />
          </div>
          <button type="submit" disabled={isPending} className="w-full h-12 rounded-xl btn-primary text-sm disabled:opacity-50 mt-4">{isPending ? "Creating member..." : "Add Member"}</button>
        </form>
      </BottomSheet>
    </div>
  );
}
