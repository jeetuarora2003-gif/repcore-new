"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Phone, Users, ChevronRight, Filter, Loader2, Download } from "lucide-react";
import { formatINR, statusLabel, statusBadgeClass } from "@/lib/helpers";
import { toast } from "sonner";
import type { MemberStatus } from "@/lib/supabase/types";
import type { MemberStatusType } from "@/lib/helpers";
import MemberAvatar from "@/components/MemberAvatar";
import EmptyState from "@/components/EmptyState";
import AddMemberWizard from "@/components/AddMemberWizard";
import { createClient } from "@/lib/supabase/client";

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

type MemberListItem = Pick<MemberStatus, "id" | "full_name" | "phone" | "photo_url" | "plan_name" | "balance_due" | "status">;

interface Props {
  gymId: string;
  members: MemberListItem[];
  plans: Plan[];
}

const PAGE_SIZE = 50;

export default function MembersClient({ gymId, members: initialMembers, plans }: Props) {
  const supabase = createClient();
  const [members, setMembers] = useState<MemberListItem[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAdd, setShowAdd] = useState(false);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialMembers.length === PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Export function
  async function handleExport() {
    if (isExporting) return;
    setIsExporting(true);
    
    try {
      // Fetch all members for this gym
      const { data, error } = await supabase
        .from("v_member_status")
        .select("full_name, phone, email, joining_date, plan_name, status, balance_due, start_date, end_date")
        .eq("gym_id", gymId)
        .order("full_name");

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error("No members to export");
        return;
      }

      // Convert to CSV
      const headers = ["Name", "Phone", "Email", "Joining Date", "Plan", "Status", "Balance Due", "Start Date", "End Date"];
      const csvRows = data.map(m => [
        `"${m.full_name}"`,
        `"${m.phone}"`,
        `"${m.email ?? ""}"`,
        m.joining_date,
        `"${m.plan_name ?? ""}"`,
        m.status,
        m.balance_due,
        m.start_date,
        m.end_date
      ].join(","));
      
      const csvContent = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `members_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${data.length} members`);
    } catch (error) {
      toast.error("Export failed: " + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  }

  // Fetch function
  const fetchMembers = useCallback(async (reset: boolean = false) => {
    setIsLoading(true);
    const currentPage = reset ? 0 : page;
    
    let query = supabase
      .from("v_member_status")
      .select("id, full_name, phone, photo_url, plan_name, balance_due, status")
      .eq("gym_id", gymId)
      .order("full_name");

    if (debouncedSearch) {
      query = query.or(`full_name.ilike.%${debouncedSearch}%,phone.ilike.%${debouncedSearch}%`);
    }

    if (filter !== "all") {
      if (filter === "has_dues") {
        query = query.gt("balance_due", 0);
      } else {
        query = query.eq("status", filter);
      }
    }

    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data } = await query;
    
    if (data) {
      setMembers(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
      if (!reset) setPage(currentPage + 1);
    }
    setIsLoading(false);
  }, [debouncedSearch, filter, gymId, page, supabase]);

  // Reset page when search or filter changes
  useEffect(() => {
    // If it's the very first render and no filters are applied, use initialMembers
    if (debouncedSearch === "" && filter === "all" && page === 0) {
      setMembers(initialMembers);
      setHasMore(initialMembers.length === PAGE_SIZE);
      return;
    }
    setPage(0);
    fetchMembers(true);
  }, [debouncedSearch, filter]);

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
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="h-12 w-12 rounded-full bg-white border border-border text-text-muted flex items-center justify-center hover:bg-hover hover:border-border-strong hover:text-accent transition-all active:scale-95 disabled:opacity-50"
              title="Export to CSV"
            >
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="h-12 px-6 rounded-full bg-accent text-white flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest shadow-lg shadow-accent/20 active:scale-95 transition-all"
            >
              <Plus size={18} strokeWidth={3} />
              Add Member
            </button>
          </div>
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
        {members.length === 0 && !isLoading ? (
          <div className="py-20">
            <EmptyState icon={Users} message={search ? "No members match your search" : "No members found"} actionLabel="Add Member" onAction={() => setShowAdd(true)} />
          </div>
        ) : (
          <>
            {members.map(m => (
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
            ))}
            
            {hasMore && (
              <div className="pt-4 pb-8 flex justify-center">
                <button
                  onClick={() => {
                    setPage(p => p + 1);
                    fetchMembers(false);
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2 h-10 px-6 rounded-full bg-white border border-border text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-hover hover:border-border-strong transition-all disabled:opacity-50"
                >
                  {isLoading && <Loader2 size={14} className="animate-spin" />}
                  Load More
                </button>
              </div>
            )}
          </>
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
