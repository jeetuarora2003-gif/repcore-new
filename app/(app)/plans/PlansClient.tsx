"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, ClipboardList, ToggleLeft, ToggleRight } from "lucide-react";
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
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0D0D14]/95 backdrop-blur-md border-b border-[#1E1E30] px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#F1F5F9]">Plans</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="h-9 px-3 rounded-xl bg-[#6366F1] flex items-center gap-1.5 text-white text-sm font-semibold active:scale-95 transition-transform"
          >
            <Plus size={16} />
            Create
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {plans.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            message="No plans yet. Create your first membership plan!"
            actionLabel="Create Plan"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          <div className="grid gap-3">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`bg-[#13131F] border rounded-2xl p-4 ${plan.is_active ? "border-[#1E1E30]" : "border-[#1E1E30] opacity-60"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-[#F1F5F9]">{plan.name}</h3>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        plan.is_active ? "bg-[#22C55E]/15 text-[#22C55E]" : "bg-slate-700 text-slate-400"
                      }`}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-[#94A3B8]">{plan.duration_days} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#F1F5F9]">{formatINR(plan.price)}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => handleToggle(plan.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                  >
                    {plan.is_active ? (
                      <ToggleRight size={18} className="text-[#22C55E]" />
                    ) : (
                      <ToggleLeft size={18} />
                    )}
                    {plan.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Plan Sheet */}
      <BottomSheet open={showCreate} onClose={() => setShowCreate(false)} title="Create Plan">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Plan Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Monthly Basic"
              className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#94A3B8] block mb-2">Duration</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {DURATION_PRESETS.map(({ label, days }) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, duration_days: days }))}
                  className={`h-9 px-3 rounded-xl text-sm font-medium transition-colors ${
                    form.duration_days === days
                      ? "bg-[#6366F1] text-white"
                      : "bg-[#1C1C2E] text-[#94A3B8] border border-[#1E1E30]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              required
              value={form.duration_days}
              onChange={e => setForm(p => ({ ...p, duration_days: Number(e.target.value) }))}
              placeholder="Custom days"
              className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Price (₹)</label>
            <input
              type="number"
              required
              min="0"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              placeholder="e.g. 1500"
              className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-[#6366F1] text-white font-semibold active:scale-95 transition-transform disabled:opacity-60"
          >
            {isPending ? "Creating..." : "Create Plan"}
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
