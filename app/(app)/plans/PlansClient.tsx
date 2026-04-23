"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, ClipboardList, ToggleLeft, ToggleRight, Zap, CheckCircle2, X } from "lucide-react";
import { formatINR } from "@/lib/helpers";
import type { Plan } from "@/lib/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmptyState from "@/components/EmptyState";
import { createPlan, togglePlanActive } from "@/app/actions/plans";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [localPlans, setLocalPlans] = useState(plans);

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
    // Optimistic: flip instantly
    setLocalPlans(prev => prev.map(p => p.id === planId ? { ...p, is_active: !p.is_active } : p));

    startTransition(async () => {
      try {
        await togglePlanActive(planId);
        router.refresh();
      } catch (err) {
        // Revert on failure
        setLocalPlans(prev => prev.map(p => p.id === planId ? { ...p, is_active: !p.is_active } : p));
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Membership Architecture</h1>
          <p className="text-sm text-text-secondary mt-1">Design and manage subscription tiers for your members</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="gap-2 px-6 h-11 uppercase tracking-[0.2em] text-xs font-bold"
        >
          <Plus size={18} strokeWidth={3} />
          Create New Plan
        </Button>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        {localPlans.length === 0 ? (
          <div className="py-20">
            <EmptyState
              icon={ClipboardList}
              message="No plans yet. Create your first membership plan!"
              actionLabel="Create Plan"
              onAction={() => setShowCreate(true)}
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {localPlans.map(plan => (
              <div
                key={plan.id}
                className={`bg-white border-2 rounded-2xl p-6 space-y-6 transition-all shadow-sm ${
                  plan.is_active 
                    ? "border-border border-t-accent hover:border-accent/40" 
                    : "opacity-60 border-border border-t-text-muted grayscale"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-text-primary tracking-tight truncate">{plan.name}</h3>
                      {plan.is_active && (
                        <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-page px-2 py-0.5 rounded-full border border-border">
                        {plan.duration_days} DAYS
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent-text font-mono tracking-tighter">{formatINR(plan.price)}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-border/60">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                    {plan.is_active ? (
                      <><CheckCircle2 size={12} className="text-accent" /> Active Tier</>
                    ) : (
                      "Inactive Tier"
                    )}
                  </span>
                  <button
                    onClick={() => handleToggle(plan.id)}
                    disabled={isPending}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-all active:scale-95"
                  >
                    {plan.is_active ? (
                      <>
                        <ToggleRight size={24} className="text-accent" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={24} />
                        Disabled
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md bg-white border border-border rounded-2xl p-0 gap-0 shadow-xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                  <Zap size={16} className="text-accent" />
                </div>
                <DialogTitle className="text-base font-bold text-text-primary tracking-tight">New Membership Tier</DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreate} className="px-6 py-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Plan Designation</label>
              <Input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Platinum Annual"
                className="h-11 font-bold"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Duration</label>
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESETS.map(({ label, days }) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, duration_days: days }))}
                    className={`h-9 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                      form.duration_days === days
                        ? "bg-accent text-white border-accent shadow-sm"
                        : "bg-page text-text-muted border-border hover:bg-hover hover:border-border-strong"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  required
                  value={form.duration_days}
                  onChange={e => setForm(p => ({ ...p, duration_days: Number(e.target.value) }))}
                  className="h-11 font-bold font-mono pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-muted uppercase tracking-widest pointer-events-none">Days</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Enrollment Fee (₹)</label>
              <Input
                type="number"
                required
                min="0"
                value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                placeholder="0"
                className="h-11 font-bold font-mono"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 uppercase tracking-[0.2em] text-xs font-bold mt-2"
            >
              {isPending ? "Configuring..." : "Finalize Plan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
