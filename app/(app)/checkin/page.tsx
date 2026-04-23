"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, ScanLine, Check, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { checkIn } from "@/app/actions/attendance";
import { formatDate, statusBadgeClass, statusLabel, statusAvatarColor, avatarColor, memberInitials } from "@/lib/helpers";
import type { MemberStatus } from "@/lib/supabase/types";
import type { MemberStatusType } from "@/lib/helpers";
import { toast } from "sonner";

export default function CheckInPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemberStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MemberStatus | null>(null);
  const [success, setSuccess] = useState(false);
  const [successTime, setSuccessTime] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [checkedInTodayIds, setCheckedInTodayIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [gymId, setGymId] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("gyms").select("id").eq("owner_id", user.id).maybeSingle().then(({ data }) => {
        if (data) {
          setGymId(data.id);
          // Fetch today's check-ins
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          supabase
            .from("attendance")
            .select("member_id")
            .eq("gym_id", data.id)
            .gte("checked_in_at", today.toISOString())
            .then(({ data: attData }) => {
              if (attData) {
                setCheckedInTodayIds(new Set(attData.map(a => a.member_id)));
              }
            });
        }
      });
    });
  }, []);

  useEffect(() => {
    if (!query.trim() || !gymId) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("v_member_status")
        .select("*")
        .eq("gym_id", gymId)
        .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(10);
      setResults(data ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, gymId]);

  function handleSelect(m: MemberStatus) {
    setSelected(m);
    setQuery(m.full_name);
    setResults([]);
  }

  const isExpiredOrLapsed = selected?.status === "expired" || selected?.status === "lapsed";
  const alreadyCheckedIn = selected ? checkedInTodayIds.has(selected.id) : false;

  function handleCheckIn() {
    if (isExpiredOrLapsed) {
      setShowConfirm(true);
      return;
    }
    doCheckIn();
  }

  function doCheckIn() {
    setShowConfirm(false);
    if (!selected || !gymId) return;
    startTransition(async () => {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        await checkIn(selected.id, gymId);
        setCheckedInTodayIds(p => new Set([...p, selected.id]));
        setSuccessTime(timeStr);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSelected(null);
          setQuery("");
          setSuccessTime("");
          inputRef.current?.focus();
        }, 2000);
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0F0F12]/95 backdrop-blur-md border-b border-[#222228] px-4 py-3">
        <h1 className="text-lg font-bold text-[#FAFAFA]">Check In</h1>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Success Flash */}
        {success && (
          <div className="bg-[#22C55E]/15 border border-[#22C55E]/30 rounded-2xl p-5 flex items-center gap-4 animate-success-flash">
            <div className="h-12 w-12 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0">
              <Check size={24} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#22C55E] text-lg">{selected?.full_name}</p>
              <p className="text-sm text-[#22C55E]/80">Checked in at {successTime} ✓</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-[#10B981] transition-colors" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); }}
            placeholder="Search by name or phone..."
            className="w-full h-14 rounded-2xl bg-[#1A1A1F] border border-[#222228] pl-11 pr-4 text-[#FAFAFA] placeholder-[#A1A1AA] focus:outline-none focus:border-[#10B981] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all duration-200 text-base"
          />
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className="w-full premium-card p-4 flex items-center gap-3 active:opacity-80 transition-all text-left"
                >
                  <div className={`h-10 w-10 rounded-full ${statusAvatarColor(m.status, m.id)} flex items-center justify-center text-white text-sm font-semibold`}>
                    {memberInitials(m.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#FAFAFA]">{m.full_name}</p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusBadgeClass(m.status as MemberStatusType)}`}>
                        {statusLabel(m.status as MemberStatusType)}
                      </span>
                    </div>
                    <p className="text-xs text-[#A1A1AA]">{m.phone}</p>
                  </div>
                  {(m.balance_due ?? 0) > 0 && (
                    <div className="flex items-center gap-1 text-xs text-[#EF4444]">
                      <AlertCircle size={12} />
                      Dues
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
  
          {/* Selected Member Card */}
          {selected && !success && (
            <div className="premium-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full ${statusAvatarColor(selected.status, selected.id)} flex items-center justify-center text-white font-semibold`}>
                  {memberInitials(selected.full_name)}
                </div>
                <div>
                  <p className="text-base font-bold text-[#FAFAFA]">{selected.full_name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(selected.status as MemberStatusType)}`}>
                      {statusLabel(selected.status as MemberStatusType)}
                    </span>
                    {selected.plan_name && (
                      <span className="text-xs text-[#A1A1AA]">{selected.plan_name}</span>
                    )}
                  </div>
                </div>
              </div>
  
              {/* Already checked in today */}
              {alreadyCheckedIn && (
                <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl p-2.5 flex items-center gap-2">
                  <Check size={14} className="text-[#22C55E]" />
                  <p className="text-xs text-[#22C55E] font-medium">Already checked in today</p>
                </div>
              )}
  
              {selected.end_date && (
                <p className="text-xs text-[#A1A1AA]">
                  Expires: {formatDate(selected.end_date)}
                  {(selected.days_until_expiry ?? 99) <= 5 && (selected.days_until_expiry ?? 99) >= 0 && (
                    <span className="text-[#F59E0B] ml-1">· Expiring soon!</span>
                  )}
                </p>
              )}
  
              {(selected.balance_due ?? 0) > 0 && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-2.5 flex items-center gap-2">
                  <AlertCircle size={14} className="text-[#EF4444]" />
                  <p className="text-xs text-[#EF4444]">Has outstanding dues</p>
                </div>
              )}
            </div>
          )}
  
          {/* Check In Button */}
          {selected && !success && (
            <button
              onClick={handleCheckIn}
              disabled={isPending}
              className="w-full h-14 rounded-2xl bg-[#22C55E] text-white text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-200 disabled:opacity-60 shadow-lg shadow-[#22C55E]/20 primary-button"
            >
              <ScanLine size={20} />
              {isPending ? "Checking in..." : `Check In ${selected.full_name.split(" ")[0]}`}
            </button>
          )}

        {/* Empty state */}
        {!query && !selected && !success && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#1A1A1F] flex items-center justify-center">
              <ScanLine size={32} className="text-[#10B981]" />
            </div>
            <p className="text-[#A1A1AA] text-sm text-center">
              Search for a member above to check them in
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for expired/lapsed */}
      {showConfirm && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-[#131316] border border-[#222228] rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#EF4444]/15 flex items-center justify-center">
                <AlertCircle size={20} className="text-[#EF4444]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#FAFAFA]">Expired Subscription</h3>
                <p className="text-sm text-[#A1A1AA]">This member&apos;s subscription has expired. Check in anyway?</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-12 rounded-xl bg-[#1A1A1F] text-[#A1A1AA] font-semibold active:scale-95 transition-transform duration-100"
              >
                Cancel
              </button>
              <button
                onClick={doCheckIn}
                disabled={isPending}
                className="flex-1 h-12 rounded-xl bg-[#22C55E] text-white font-semibold active:scale-95 transition-transform duration-100 disabled:opacity-60"
              >
                Check In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
