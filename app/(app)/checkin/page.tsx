"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, ScanLine, Check, AlertCircle, UserCheck, ShieldAlert, Sparkles, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { checkIn } from "@/app/actions/attendance";
import { formatDate, statusBadgeClass, statusLabel, formatINR } from "@/lib/helpers";
import type { MemberStatus } from "@/lib/supabase/types";
import type { MemberStatusType } from "@/lib/helpers";
import { toast } from "sonner";
import MemberAvatar from "@/components/MemberAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        }, 3000);
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Access Control</h1>
        <p className="text-sm text-text-secondary mt-1">Scan or search members for immediate entry validation</p>
      </div>

      <div className="space-y-6">
        {/* Success Flash */}
        {success && (
          <div className="bg-status-success-bg border-2 border-status-success-border rounded-[2rem] p-8 flex flex-col items-center text-center animate-fade-up shadow-lg">
            <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center mb-4 border-4 border-white shadow-md">
              <UserCheck size={36} className="text-white" />
            </div>
            <h2 className="text-[10px] font-bold text-accent-text uppercase tracking-[0.4em] mb-2">Access Granted</h2>
            <p className="text-2xl font-bold text-text-primary tracking-tight">{selected?.full_name}</p>
            <p className="text-[11px] font-bold text-accent-text mt-2 uppercase tracking-widest bg-white/50 px-4 py-1.5 rounded-full border border-status-success-border">
              Validated at {successTime}
            </p>
          </div>
        )}

        {/* Search Input */}
        {!success && (
          <div className="relative group">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null); }}
              placeholder="Search Name or Phone..."
              className="w-full h-16 rounded-[2rem] bg-white border-2 border-border pl-14 pr-6 text-base text-text-primary font-bold placeholder:text-text-muted/50 focus:border-accent focus:ring-8 focus:ring-accent/5 outline-none transition-all shadow-sm"
            />
          </div>
        )}

        {/* Search Results Overlay-like list */}
        {results.length > 0 && !selected && !success && (
          <div className="grid gap-3 animate-fade-in">
            {results.map(m => (
              <button
                key={m.id}
                onClick={() => handleSelect(m)}
                className="w-full bg-white border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-accent/40 hover:shadow-md transition-all text-left group"
              >
                <MemberAvatar name={m.full_name} memberId={m.id} size="sm" status={m.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">{m.full_name}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${statusBadgeClass(m.status as MemberStatusType)}`}>
                      {statusLabel(m.status as MemberStatusType)}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-text-muted font-mono mt-0.5">{m.phone}</p>
                </div>
                <ChevronRight size={16} className="text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}

        {/* Selected Member Detail */}
        {selected && !success && (
          <div className="bg-white border-2 border-border rounded-[2rem] p-8 space-y-8 animate-fade-up shadow-sm">
            <div className="flex flex-col items-center text-center space-y-4">
              <MemberAvatar name={selected.full_name} memberId={selected.id} size="lg" status={selected.status} />
              <div>
                <h3 className="text-2xl font-bold text-text-primary tracking-tight">{selected.full_name}</h3>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border ${statusBadgeClass(selected.status as MemberStatusType)}`}>
                    {statusLabel(selected.status as MemberStatusType)}
                  </span>
                  {selected.plan_name && (
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-page px-3 py-1 rounded-full border border-border">
                      {selected.plan_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-page p-4 rounded-2xl border border-border">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Status Check</p>
                {alreadyCheckedIn ? (
                  <div className="flex items-center gap-2 text-accent-text font-bold text-xs uppercase tracking-tight">
                    <Check size={14} strokeWidth={3} /> Double Check-in
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-text-primary font-bold text-xs uppercase tracking-tight">
                    <Sparkles size={14} className="text-accent" /> First Visit Today
                  </div>
                )}
              </div>
              <div className="bg-page p-4 rounded-2xl border border-border">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Expiry Forecast</p>
                <div className={`text-xs font-bold uppercase ${isExpiredOrLapsed ? "text-status-danger-text" : "text-text-primary"}`}>
                  {selected.end_date ? formatDate(selected.end_date) : "No Plan"}
                </div>
              </div>
            </div>

            {/* Dues Alert */}
            {(selected.balance_due ?? 0) > 0 && (
              <div className="bg-status-danger-bg border border-status-danger-border rounded-2xl p-4 flex items-center gap-4">
                <ShieldAlert size={20} className="text-status-danger-text shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-status-danger-text uppercase tracking-widest">Outstanding Collection</p>
                  <p className="text-sm font-bold text-status-danger-text font-mono">Dues: {formatINR(selected.balance_due)}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleCheckIn}
              disabled={isPending}
              className="w-full h-16 rounded-2xl bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-accent/20 active:scale-[0.98] disabled:opacity-50"
            >
              <ScanLine size={20} strokeWidth={3} />
              {isPending ? "Validating..." : "Authorize Entry"}
            </button>
            
            <button 
              onClick={() => { setSelected(null); setQuery(""); }}
              className="w-full text-[10px] font-bold text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors"
            >
              Cancel and Reset
            </button>
          </div>
        )}

        {/* Empty State */}
        {!query && !selected && !success && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
            <div className="h-24 w-24 rounded-[2rem] bg-white border-2 border-border flex items-center justify-center shadow-sm">
              <ScanLine size={40} className="text-text-muted opacity-30" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-text-secondary uppercase tracking-[0.2em]">Ready to Validate</p>
              <p className="text-xs text-text-muted font-medium max-w-[280px]">Scan a member QR or search by phone number to initialize the access control sequence.</p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Overlay */}
      {showConfirm && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-sidebar/80 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white border-2 border-border rounded-[2.5rem] p-10 max-w-sm w-full animate-fade-up shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-status-danger-bg flex items-center justify-center text-status-danger-text border border-status-danger-border">
                <ShieldAlert size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-text-primary uppercase tracking-tight">Expired Credentials</h3>
                <p className="text-xs text-text-secondary font-medium leading-relaxed">
                  This member&apos;s subscription architecture has reached its terminal date. Do you wish to override and authorize entry anyway?
                </p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={doCheckIn}
                  disabled={isPending}
                  className="h-12 rounded-xl bg-status-danger-text text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-status-danger-text/20 transition-all active:scale-95"
                >
                  Override & Authorize
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="h-12 rounded-xl bg-white border-2 border-border text-text-muted text-[10px] font-bold uppercase tracking-widest hover:bg-hover transition-all"
                >
                  Cancel Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
