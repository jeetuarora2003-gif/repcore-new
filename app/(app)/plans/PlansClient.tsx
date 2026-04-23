"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, ClipboardList, ToggleLeft, ToggleRight, Zap } from "lucide-react";
import { formatINR } from "@/lib/helpers";
import type { Plan } from "@/lib/supabase/types";
import BottomSheet from "@/components/BottomSheet";
import EmptyState from "@/components/EmptyState";
import { createPlan, togglePlanActive } from "@/app/actions/plans";
import { toast } from "sonner";

interface Props {
  gymId: string;
  plans: Plan[];
}

const DURATION_PRESETS = [
  { label: "1 Month", days: 30 },
  { label: "2 Months", days: 60 },
  { label: "3 Months", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "1 Year", days: 365 },
];

export default function PlansClient({ gymId, plans }: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", duration_days: 30, price: "" });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createPlan({ gym_id: gymId, name: form.name, duration_days: form.duration_days, price: Number(form.price) });
        toast.success("Plan created!");
        setShowCreate(false);
        setForm({ name: "", duration_days: 30, price: "" });
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleToggle(planId: string) {
    startTransition(async () => {
      try {
        await togglePlanActive(planId);
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <div className="pb-24 min-h-screen bg-[#080810] animate-fade-up">
      {/* Header Sticky */}
      <div className="sticky top-[48px] z-20 bg-[#080810]/95 backdrop-blur-md border-b border-white/5 px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] border border-[#6366F1]/20">
              <Zap size={14} strokeWidth={2.5} />
            </div>
            <h1 className="text-sm font-semibold text-[#F8FAFC]">Membership Plans</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="h-9 px-4 rounded-xl bg-[#6366F1] flex items-center gap-2 text-white text-xs font-semibold shadow-lg shadow-[#6366F1]/20 active:scale-95 transition-all hover:brightness-110"
          >
            <Plus size={16} />
            Create Plan
          </button>
        </div>
      </div>

      <div className="px-4 py-6 md:px-8 max-w-4xl mx-auto">
        {plans.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            message="No plans yet. Create your first membership plan!"
            actionLabel="Create Plan"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`card p-5 space-y-4 ${plan.is_active ? "border-white/6" : "opacity-50 border-white/4"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[15px] font-semibold text-[#F8FAFC] tracking-tight truncate">{plan.name}</h3>
                      {plan.is_active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-sm shadow-[#10B981]/50" />
                      )}
                    </div>
                    <p className="text-xs text-[#94A3B8] font-mono tracking-wider uppercase">{plan.duration_days} DAYS DURATION</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#6366F1] font-mono tracking-tighter">{formatINR(plan.price)}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] font-bold text-[#475569] uppercase tracking-[0.15em]">
                    {plan.is_active ? "Available for assignment" : "Currently hidden"}
                  </span>
                  <button
                    onClick={() => handleToggle(plan.id)}
                    disabled={isPending}
                    className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                  >
                    {plan.is_active ? (
                      <>
                        <ToggleRight size={20} className="text-[#10B981]" />
                        Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={20} />
                        Inactive
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Plan Sheet */}
      <BottomSheet open={showCreate} onClose={() => setShowCreate(false)} title="Create New Plan">
        <form onSubmit={handleCreate} className="space-y-6 pt-4 pb-8">
          <div>
            <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">Plan Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. 3 Months Gold"
              className="w-full h-11 rounded-xl bg-[#080810] border border-white/8 px-4 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1]/40 focus:ring-4 focus:ring-[#6366F1]/5 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#94A3B8] block mb-3">Duration Presets</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {DURATION_PRESETS.map(({ label, days }) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, duration_days: days }))}
                  className={`h-9 px-4 rounded-xl text-xs font-medium transition-all border ${
                    form.duration_days === days
                      ? "bg-[#6366F1]/10 border-[#6366F1]/40 text-[#6366F1]"
                      : "bg-[#080810] text-[#94A3B8] border-white/8 hover:border-white/12"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={form.duration_days}
                onChange={e => setForm(p => ({ ...p, duration_days: Number(e.target.value) }))}
                className="w-full h-11 rounded-xl bg-[#080810] border border-white/8 px-4 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]/40 transition-all font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#475569] uppercase tracking-widest pointer-events-none">Days</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">Plan Price (₹)</label>
            <input
              type="number"
              required
              min="0"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              placeholder="0.00"
              className="w-full h-11 rounded-xl bg-[#080810] border border-white/8 px-4 text-sm text-[#F8FAFC] font-mono focus:outline-none focus:border-[#6366F1]/40 focus:ring-4 focus:ring-[#6366F1]/5 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-[#6366F1] text-white text-sm font-semibold shadow-lg shadow-[#6366F1]/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {isPending ? "Building plan..." : "Create Membership Plan"}
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
