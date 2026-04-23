"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Phone, ScanLine, CreditCard, Bell, Snowflake,
  Plus, MessageCircle, Check, AlertCircle, ChevronDown, ChevronUp,
  Mail, Calendar, FileText, Zap, Clock, History, IndianRupee
} from "lucide-react";
import { formatINR, formatDate, statusBadgeClass, statusLabel, memberInitials } from "@/lib/helpers";
import type { Gym, Invoice, Payment, Attendance, Plan, Reminder, MemberStatus, Subscription } from "@/lib/supabase/types";
import type { MemberStatusType } from "@/lib/helpers";
import MemberAvatar from "@/components/MemberAvatar";
import BottomSheet from "@/components/BottomSheet";
import { checkIn } from "@/app/actions/attendance";
import { recordPayment, addSubscription } from "@/app/actions/subscriptions";
import { toggleFreeze } from "@/app/actions/members";
import { markReminderSent } from "@/app/actions/reminders";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  gym: Gym;
  member: MemberStatus;
  invoices: Invoice[];
  payments: Payment[];
  attendance: Attendance[];
  plans: Plan[];
  reminders: Reminder[];
  subscriptions: Subscription[];
}

type TabType = "overview" | "billing" | "attendance";

const PAYMENT_METHODS = ["cash", "upi", "card", "bank_transfer"] as const;
type PaymentMethod = typeof PAYMENT_METHODS[number];

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  bank_transfer: "Bank",
};

export default function MemberDetailClient({ gym, member, invoices, payments, attendance, plans, reminders, subscriptions }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>("overview");
  const [showPayment, setShowPayment] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showConfirmCheckin, setShowConfirmCheckin] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [payForm, setPayForm] = useState({
    amount: String(Math.max(0, member.balance_due ?? 0)),
    method: "cash" as PaymentMethod,
    notes: "",
    invoice_id: "",
  });

  const [planForm, setPlanForm] = useState({
    plan_id: plans[0]?.id ?? "",
    start_date: new Date().toISOString().split("T")[0],
  });

  const isExpiredOrLapsed = member.status === "expired" || member.status === "lapsed";

  function handleCheckIn() {
    if (isExpiredOrLapsed) {
      setShowConfirmCheckin(true);
      return;
    }
    doCheckIn();
  }

  function doCheckIn() {
    setShowConfirmCheckin(false);
    startTransition(async () => {
      try {
        await checkIn(member.id, member.gym_id);
        toast.success("Checked in successfully!");
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await recordPayment({
          gym_id: gym.id,
          member_id: member.id,
          invoice_id: payForm.invoice_id || undefined,
          amount: Number(payForm.amount),
          payment_method: payForm.method,
          notes: payForm.notes,
        });
        toast.success("Payment recorded!");
        setShowPayment(false);
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleAddPlan(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await addSubscription(member.id, planForm.plan_id, planForm.start_date, gym.id);
        toast.success("Plan added!");
        setShowPlan(false);
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleRemind() {
    if (!member.subscription_id) {
      toast.error("No active subscription to remind about");
      return;
    }
    const msg = encodeURIComponent(
      `Hi ${member.full_name}! 🏋️ Your ${member.plan_name ?? "membership"} at ${gym.name} expires on ${formatDate(member.end_date)}. Renew now to continue your fitness journey! Call/WhatsApp us: ${gym.phone}`
    );
    window.open(`https://wa.me/91${member.phone.replace(/\D/g, "")}?text=${msg}`, "_blank");

    startTransition(async () => {
      try {
        await markReminderSent(member.id, member.subscription_id!, 1, gym.id);
      } catch {}
    });
  }

  const daysRemaining = member.days_until_expiry ?? 0;
  const planDuration = member.duration_days ?? plans.find(p => p.name === member.plan_name)?.duration_days ?? 30;
  const progress = member.start_date && member.end_date
    ? Math.min(100, Math.max(0, ((daysRemaining) / planDuration) * 100))
    : 0;

  const checkedInToday = attendance.some(a => {
    const d = new Date(a.checked_in_at).toDateString();
    return d === new Date().toDateString();
  });

  // Build attendance day grid
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOffset = new Date(currentYear, currentMonth, 1).getDay();
  const attendedDays = new Set(
    attendance
      .filter(a => {
        const d = new Date(a.checked_in_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .map(a => new Date(a.checked_in_at).getDate())
  );

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header Profile Section */}
      <div className="bg-white border border-border rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <MemberAvatar name={member.full_name} memberId={member.id} photoUrl={member.photo_url} size="xl" status={member.status} />
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">{member.full_name}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${statusBadgeClass(member.status as MemberStatusType)}`}>
                {statusLabel(member.status as MemberStatusType)}
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6">
              <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-accent transition-colors font-mono">
                <Phone size={14} />
                {member.phone}
              </a>
              <div className="flex items-center gap-2 text-sm font-semibold text-text-muted">
                <Calendar size={14} />
                Joined {formatDate(member.joining_date)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              <button
                onClick={handleCheckIn}
                disabled={checkedInToday || isPending}
                className={`h-10 px-5 rounded-full flex items-center gap-2 text-xs font-bold transition-all ${
                  checkedInToday 
                    ? "bg-hover text-text-muted border border-border cursor-not-allowed" 
                    : "bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent-hover active:scale-95"
                }`}
              >
                <ScanLine size={16} />
                {checkedInToday ? "Checked In" : "Quick Check-in"}
              </button>
              <button
                onClick={() => setShowPlan(true)}
                className="h-10 px-5 rounded-full bg-white border border-border text-text-primary text-xs font-bold hover:bg-hover hover:border-border-strong transition-all active:scale-95 shadow-sm"
              >
                Change Plan
              </button>
              <button
                onClick={() => setShowPayment(true)}
                className="h-10 px-5 rounded-full bg-status-success-bg text-status-success-text border border-status-success-border text-xs font-bold hover:brightness-95 transition-all active:scale-95 shadow-sm"
              >
                Record Payment
              </button>
              <button
                onClick={handleRemind}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-border text-text-muted hover:text-text-primary hover:border-border-strong transition-all shadow-sm"
              >
                <Bell size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Tab Bar */}
        <div className="sticky top-[56px] z-20 py-2 bg-page/80 backdrop-blur-md">
          <Tabs value={tab} onValueChange={(v: string) => setTab(v as TabType)}>
            <TabsList className="bg-white border border-border w-full flex">
              {(["overview", "billing", "attendance"] as TabType[]).map(t => (
                <TabsTrigger key={t} value={t} className="flex-1 capitalize">
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {tab === "overview" && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Subscription Status */}
              <div className="bg-white border border-border rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent-light flex items-center justify-center text-accent-text border border-accent-border">
                    <Zap size={16} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Subscription</h3>
                </div>

                {member.subscription_id ? (
                  <div className="space-y-5">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xl font-bold text-text-primary tracking-tight">{member.plan_name}</p>
                        <p className="text-xs font-semibold text-text-muted mt-0.5 uppercase">Started {formatDate(member.start_date)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold font-mono ${daysRemaining > 7 ? "text-status-success-text" : daysRemaining > 3 ? "text-status-warning-text" : "text-status-danger-text"}`}>
                          {daysRemaining} Days Left
                        </p>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Ends {formatDate(member.end_date)}</p>
                      </div>
                    </div>
                    <div className="h-2 bg-hover rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          daysRemaining > 7 ? "bg-accent" : daysRemaining > 3 ? "bg-status-warning-text" : "bg-status-danger-text"
                        }`} 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm font-semibold text-text-muted mb-4">No active plan found</p>
                    <button onClick={() => setShowPlan(true)} className="px-6 h-10 rounded-full bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-all shadow-sm">
                      Assign Plan
                    </button>
                  </div>
                )}
              </div>

              {/* Notes / Meta */}
              <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-hover flex items-center justify-center text-text-muted border border-border">
                    <FileText size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Internal Notes</h3>
                </div>
                <div className="bg-page rounded-xl p-4 border border-border min-h-[100px]">
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">
                    {member.notes || "No additional notes for this member."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === "billing" && (
            <div className="space-y-8">
              {/* Billing Summary */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Invoiced", value: formatINR(member.total_invoiced ?? 0), color: "text-text-primary" },
                  { label: "Paid", value: formatINR(member.total_paid ?? 0), color: "text-status-success-text" },
                  { label: "Due", value: formatINR(member.balance_due ?? 0), color: (member.balance_due ?? 0) > 0 ? "text-status-danger-text" : "text-status-success-text" },
                ].map((item) => (
                  <div key={item.label} className="bg-white border border-border rounded-2xl p-5 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`text-xl font-bold font-mono tracking-tighter ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Ledger */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-text-muted tracking-[0.2em] uppercase px-1 flex items-center gap-2">
                    <IndianRupee size={10} />
                    Payment History
                  </p>
                  <div className="bg-white border border-border rounded-2xl divide-y divide-border overflow-hidden">
                    {payments.length === 0 ? (
                      <p className="text-xs text-text-muted py-8 text-center italic font-semibold">No payments recorded</p>
                    ) : (
                      payments.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 hover:bg-hover transition-colors">
                          <div>
                            <p className="text-sm font-bold text-text-primary">{METHOD_LABELS[p.payment_method as PaymentMethod]}</p>
                            <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-wider">{formatDate(p.paid_at)}</p>
                          </div>
                          <span className="text-sm font-bold font-mono text-status-success-text">+{formatINR(p.amount)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-text-muted tracking-[0.2em] uppercase px-1 flex items-center gap-2">
                    <FileText size={10} />
                    Invoices
                  </p>
                  <div className="bg-white border border-border rounded-2xl divide-y divide-border overflow-hidden">
                    {invoices.length === 0 ? (
                      <p className="text-xs text-text-muted py-8 text-center italic font-semibold">No invoices issued</p>
                    ) : (
                      invoices.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-hover transition-colors">
                          <div>
                            <p className="text-sm font-bold text-text-primary">#{inv.invoice_number}</p>
                            <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-wider">{formatDate(inv.created_at)}</p>
                          </div>
                          <span className="text-sm font-bold font-mono text-text-primary">{formatINR(inv.amount)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "attendance" && (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <p className="text-[10px] font-bold text-text-muted tracking-[0.2em] uppercase px-1 flex items-center gap-2">
                  <Calendar size={10} />
                  Check-in Heatmap
                </p>
                <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                  <div className="grid grid-cols-7 gap-3">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                      <div key={d} className="h-8 flex items-center justify-center text-[10px] font-bold text-text-muted uppercase tracking-widest">{d}</div>
                    ))}
                    {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const attended = attendedDays.has(day);
                      const isToday = day === now.getDate();
                      return (
                        <div key={day} className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-all border ${
                          attended 
                            ? "bg-accent border-accent text-white shadow-md shadow-accent/20 scale-105 z-10" 
                            : isToday 
                              ? "border-accent text-accent ring-2 ring-accent/10" 
                              : "bg-page border-border text-text-muted hover:border-border-strong hover:bg-hover"
                        }`}>
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-text-muted tracking-[0.2em] uppercase px-1 flex items-center gap-2">
                  <History size={10} />
                  Recent Log
                </p>
                <div className="bg-white border border-border rounded-2xl divide-y divide-border overflow-hidden max-h-[440px] overflow-y-auto scrollbar-hide">
                  {attendance.length === 0 ? (
                    <div className="p-12 text-center text-xs text-text-muted font-semibold italic">No check-ins logged</div>
                  ) : (
                    attendance.map(a => (
                      <div key={a.id} className="p-4 flex justify-between items-center hover:bg-hover transition-colors">
                        <span className="text-xs font-bold text-text-primary font-mono">{formatDate(a.checked_in_at)}</span>
                        <span className="text-[11px] text-text-muted font-bold font-mono uppercase">
                          {new Date(a.checked_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Sheets with updated UI */}
      <BottomSheet open={showPayment} onClose={() => setShowPayment(false)} title="Record New Payment">
        <form onSubmit={handlePayment} className="space-y-6 pt-4 pb-8">
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Payment Amount (₹)</label>
            <input 
              type="number" 
              required 
              value={payForm.amount} 
              onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} 
              className="w-full h-12 rounded-xl bg-page border border-border px-4 text-sm text-text-primary font-bold font-mono focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-3">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map(m => (
                <button 
                  key={m} 
                  type="button" 
                  onClick={() => setPayForm(p => ({ ...p, method: m }))} 
                  className={`h-11 rounded-xl text-xs font-bold transition-all border ${
                    payForm.method === m 
                      ? "bg-accent-light border-accent/40 text-accent-text shadow-sm" 
                      : "bg-white border-border text-text-muted hover:bg-hover hover:border-border-strong"
                  }`}
                >
                  {METHOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={isPending} className="w-full h-12 rounded-xl bg-accent text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-50 mt-4 shadow-lg shadow-accent/20 uppercase tracking-widest">Record Transaction</button>
        </form>
      </BottomSheet>

      <BottomSheet open={showPlan} onClose={() => setShowPlan(false)} title="Assign New Plan">
        <form onSubmit={handleAddPlan} className="space-y-6 pt-4 pb-8">
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Membership Plan</label>
            <select 
              value={planForm.plan_id} 
              onChange={e => setPlanForm(p => ({ ...p, plan_id: e.target.value }))} 
              className="w-full h-12 rounded-xl bg-page border border-border px-4 text-sm text-text-primary font-bold focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none"
            >
              {plans.map(pl => <option key={pl.id} value={pl.id}>{pl.name} — {pl.duration_days} days — {formatINR(pl.price)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Activation Date</label>
            <input 
              type="date" 
              value={planForm.start_date} 
              onChange={e => setPlanForm(p => ({ ...p, start_date: e.target.value }))} 
              className="w-full h-12 rounded-xl bg-page border border-border px-4 text-sm text-text-primary font-bold focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none" 
            />
          </div>
          <button type="submit" disabled={isPending} className="w-full h-12 rounded-xl bg-accent text-white text-sm font-bold active:scale-[0.98] transition-all mt-4 shadow-lg shadow-accent/20 uppercase tracking-widest">Confirm Plan Change</button>
        </form>
      </BottomSheet>
    </div>
  );
}
