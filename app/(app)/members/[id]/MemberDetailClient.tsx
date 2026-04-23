"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Phone, ScanLine, CreditCard, Bell, Snowflake,
  Plus, MessageCircle, Check, AlertCircle, ChevronDown, ChevronUp,
  Mail, Calendar, FileText, Zap
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
    <div className="pb-24 min-h-screen bg-[#080810] animate-fade-up">
      {/* Header Profile Section */}
      <div className="bg-gradient-to-b from-surface to-[#080810] pt-6 pb-10 px-4 md:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <MemberAvatar name={member.full_name} memberId={member.id} size="xl" status={member.status} rounded="2xl" />
            
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">{member.full_name}</h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium tracking-tight ${statusBadgeClass(member.status as MemberStatusType)}`}>
                  {statusLabel(member.status as MemberStatusType)}
                </span>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#6366F1] transition-colors font-mono">
                  <Phone size={14} strokeWidth={1.5} />
                  {member.phone}
                </a>
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                    <Mail size={14} strokeWidth={1.5} />
                    {member.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-[#94A3B8] font-mono">
                  <Calendar size={14} strokeWidth={1.5} />
                  Joined {formatDate(member.joining_date)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                <button
                  onClick={handleCheckIn}
                  disabled={checkedInToday || isPending}
                  className={`h-9 px-4 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${
                    checkedInToday 
                      ? "bg-white/5 text-[#475569] border border-white/5 cursor-not-allowed" 
                      : "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/20 hover:brightness-110 active:scale-95"
                  }`}
                >
                  <ScanLine size={14} />
                  {checkedInToday ? "Checked In" : "Quick Check-in"}
                </button>
                <button
                  onClick={() => setShowPlan(true)}
                  className="h-9 px-4 rounded-xl bg-surface border border-white/8 text-[#F8FAFC] text-xs font-semibold hover:border-white/12 hover:bg-surface-2 transition-all active:scale-95"
                >
                  Change Plan
                </button>
                <button
                  onClick={() => setShowPayment(true)}
                  className="h-9 px-4 rounded-xl bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 text-xs font-semibold hover:bg-[#6366F1]/15 transition-all active:scale-95"
                >
                  Record Payment
                </button>
                <button
                  onClick={handleRemind}
                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-surface border border-white/8 text-[#94A3B8] hover:text-[#F8FAFC] transition-all"
                >
                  <Bell size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-8">
        {/* Tab Bar */}
        <div className="bg-surface border border-white/6 rounded-2xl p-1 flex gap-1 mb-8">
          {(["overview", "billing", "attendance"] as TabType[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-medium capitalize rounded-xl transition-all duration-200 ${
                tab === t
                  ? "bg-surface-3 text-[#F8FAFC] shadow-sm"
                  : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/3"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {tab === "overview" && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Subscription Status */}
              <div className="card p-5 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] border border-[#6366F1]/20">
                    <Zap size={14} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#F8FAFC]">Active Subscription</h3>
                </div>

                {member.subscription_id ? (
                  <div className="space-y-5">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-lg font-bold text-[#F8FAFC] tracking-tight">{member.plan_name}</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Started {formatDate(member.start_date)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold font-mono ${daysRemaining > 7 ? "text-[#10B981]" : daysRemaining > 3 ? "text-[#F59E0B]" : "text-[#EF4444]"}`}>
                          {daysRemaining} Days Left
                        </p>
                        <p className="text-[10px] text-[#475569] uppercase tracking-wider font-semibold">Ends {formatDate(member.end_date)}</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          daysRemaining > 7 ? "bg-[#6366F1]" : daysRemaining > 3 ? "bg-[#F59E0B]" : "bg-[#EF4444]"
                        }`} 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm text-[#94A3B8] mb-4">No active plan found</p>
                    <button onClick={() => setShowPlan(true)} className="px-5 h-9 rounded-xl bg-[#6366F1] text-white text-xs font-semibold hover:brightness-110 transition-all">
                      Assign Plan
                    </button>
                  </div>
                )}
              </div>

              {/* Notes / Meta */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[#94A3B8]/10 flex items-center justify-center text-[#94A3B8] border border-white/10">
                    <FileText size={14} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#F8FAFC]">Administrative Notes</h3>
                </div>
                <div className="bg-bg/50 rounded-xl p-4 border border-white/4 min-h-[100px]">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {member.notes || "No additional notes for this member."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === "billing" && (
            <div className="space-y-8">
              {/* Billing Summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Invoiced", value: formatINR(member.total_invoiced ?? 0), color: "text-[#F8FAFC]" },
                  { label: "Paid", value: formatINR(member.total_paid ?? 0), color: "text-[#10B981]" },
                  { label: "Due", value: formatINR(member.balance_due ?? 0), color: (member.balance_due ?? 0) > 0 ? "text-[#EF4444]" : "text-[#10B981]" },
                ].map((item) => (
                  <div key={item.label} className="card p-4 text-center">
                    <p className="text-[10px] font-semibold text-[#475569] uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`text-lg font-bold font-mono tracking-tighter ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Ledger */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-semibold text-[#475569] tracking-[0.2em] uppercase px-1">Payment History</p>
                  <div className="space-y-px">
                    {payments.length === 0 ? (
                      <p className="text-xs text-[#475569] py-4 text-center italic">No payments yet</p>
                    ) : (
                      payments.map(p => (
                        <div key={p.id} className="flex items-center justify-between py-3.5 border-b border-white/5">
                          <div>
                            <p className="text-sm font-medium text-[#F8FAFC]">{METHOD_LABELS[p.payment_method as PaymentMethod]}</p>
                            <p className="text-[11px] font-mono text-[#475569] mt-0.5 uppercase">PAID {formatDate(p.paid_at)}</p>
                          </div>
                          <span className="text-sm font-bold font-mono text-[#10B981]">{formatINR(p.amount)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-semibold text-[#475569] tracking-[0.2em] uppercase px-1">Recent Invoices</p>
                  <div className="space-y-px">
                    {invoices.length === 0 ? (
                      <p className="text-xs text-[#475569] py-4 text-center italic">No invoices found</p>
                    ) : (
                      invoices.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between py-3.5 border-b border-white/5">
                          <div>
                            <p className="text-sm font-medium text-[#F8FAFC]">#{inv.invoice_number}</p>
                            <p className="text-[11px] font-mono text-[#475569] mt-0.5 uppercase">ISSUED {formatDate(inv.created_at)}</p>
                          </div>
                          <span className="text-sm font-bold font-mono text-[#F8FAFC]">{formatINR(inv.amount)}</span>
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
                <p className="text-[10px] font-semibold text-[#475569] tracking-[0.2em] uppercase px-1">Monthly Attendance</p>
                <div className="card p-6">
                  <div className="grid grid-cols-7 gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                      <div key={d} className="h-8 flex items-center justify-center text-[10px] font-semibold text-[#475569] uppercase tracking-tighter">{d}</div>
                    ))}
                    {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const attended = attendedDays.has(day);
                      const isToday = day === now.getDate();
                      return (
                        <div key={day} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-all border ${
                          attended 
                            ? "bg-[#6366F1] border-[#6366F1] text-white shadow-lg shadow-[#6366F1]/20 scale-105 z-10" 
                            : isToday 
                              ? "border-[#6366F1] text-[#6366F1]" 
                              : "bg-surface border-white/5 text-[#475569] hover:border-white/10"
                        }`}>
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-semibold text-[#475569] tracking-[0.2em] uppercase px-1">Recent History</p>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  {attendance.length === 0 ? (
                    <div className="card p-8 text-center text-xs text-[#475569]">No check-ins yet</div>
                  ) : (
                    attendance.map(a => (
                      <div key={a.id} className="card p-3 flex justify-between items-center group hover:bg-white/3 transition-all">
                        <span className="text-xs font-semibold text-[#F8FAFC] font-mono">{formatDate(a.checked_in_at)}</span>
                        <span className="text-[11px] text-[#475569] font-mono">{new Date(a.checked_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
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
            <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">Payment Amount (₹)</label>
            <input 
              type="number" 
              required 
              value={payForm.amount} 
              onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} 
              className="w-full h-11 rounded-xl bg-[#080810] border border-white/8 px-4 text-sm text-[#F8FAFC] font-mono focus:border-[#6366F1]/40 focus:ring-4 focus:ring-[#6366F1]/5 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#94A3B8] block mb-3">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map(m => (
                <button 
                  key={m} 
                  type="button" 
                  onClick={() => setPayForm(p => ({ ...p, method: m }))} 
                  className={`h-11 rounded-xl text-xs font-medium transition-all border ${
                    payForm.method === m 
                      ? "bg-[#6366F1]/10 border-[#6366F1]/40 text-[#6366F1] shadow-sm shadow-[#6366F1]/10" 
                      : "bg-surface border-white/6 text-[#94A3B8] hover:border-white/12"
                  }`}
                >
                  {METHOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={isPending} className="w-full h-12 rounded-xl bg-[#6366F1] text-white text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-50 mt-4 shadow-lg shadow-[#6366F1]/20">Record Transaction</button>
        </form>
      </BottomSheet>

      <BottomSheet open={showPlan} onClose={() => setShowPlan(false)} title="Assign New Plan">
        <form onSubmit={handleAddPlan} className="space-y-6 pt-4 pb-8">
          <div>
            <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">Select Membership Plan</label>
            <select 
              value={planForm.plan_id} 
              onChange={e => setPlanForm(p => ({ ...p, plan_id: e.target.value }))} 
              className="w-full h-11 rounded-xl bg-[#080810] border border-white/8 px-4 text-sm text-[#F8FAFC] focus:border-[#6366F1]/40 focus:ring-4 focus:ring-[#6366F1]/5 outline-none"
            >
              {plans.map(pl => <option key={pl.id} value={pl.id}>{pl.name} — {pl.duration_days} days — {formatINR(pl.price)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">Effective Start Date</label>
            <input 
              type="date" 
              value={planForm.start_date} 
              onChange={e => setPlanForm(p => ({ ...p, start_date: e.target.value }))} 
              className="w-full h-11 rounded-xl bg-[#080810] border border-white/8 px-4 text-sm text-[#F8FAFC] focus:border-[#6366F1]/40 focus:ring-4 focus:ring-[#6366F1]/5 outline-none" 
            />
          </div>
          <button type="submit" disabled={isPending} className="w-full h-12 rounded-xl bg-[#6366F1] text-white text-sm font-semibold active:scale-[0.98] transition-all mt-4 shadow-lg shadow-[#6366F1]/20">Assign Membership</button>
        </form>
      </BottomSheet>
    </div>
  );
}
