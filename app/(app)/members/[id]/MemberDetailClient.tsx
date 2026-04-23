"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Phone, ScanLine, CreditCard, Bell, Snowflake,
  Plus, MessageCircle, Check, AlertCircle, ChevronDown, ChevronUp
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
  const [showSubHistory, setShowSubHistory] = useState(false);
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

  function handleFreeze() {
    startTransition(async () => {
      try {
        await toggleFreeze(member.id);
        toast.success(member.is_frozen ? "Member unfrozen" : "Member frozen");
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

  // Build attendance day grid for current month
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
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0D0D14]/95 backdrop-blur-md border-b border-[#1E1E30] px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/members" className="h-9 w-9 rounded-xl bg-[#1C1C2E] flex items-center justify-center">
            <ChevronLeft size={20} className="text-[#F1F5F9]" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#F1F5F9] truncate">{member.full_name}</h1>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-4 pt-5 pb-4">
        <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <MemberAvatar name={member.full_name} memberId={member.id} size="lg" status={member.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-[#F1F5F9]">{member.full_name}</h2>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(member.status as MemberStatusType)}`}>
                  {statusLabel(member.status as MemberStatusType)}
                </span>
              </div>
              <a
                href={`tel:${member.phone}`}
                className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#6366F1] mt-1"
              >
                <Phone size={12} />
                {member.phone}
              </a>
              {member.email && (
                <p className="text-xs text-[#94A3B8] mt-0.5">{member.email}</p>
              )}
            </div>
          </div>

          {/* Already checked in today notice */}
          {checkedInToday && (
            <div className="mt-3 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl p-2.5 flex items-center gap-2">
              <Check size={14} className="text-[#22C55E]" />
              <p className="text-xs text-[#22C55E] font-medium">Already checked in today</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: "Check In", icon: ScanLine, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10", action: handleCheckIn },
              { label: "Add Plan", icon: Plus, color: "text-[#6366F1]", bg: "bg-[#6366F1]/10", action: () => setShowPlan(true) },
              { label: "Payment", icon: CreditCard, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", action: () => setShowPayment(true) },
              { label: "Remind", icon: Bell, color: "text-[#94A3B8]", bg: "bg-[#1C1C2E]", action: handleRemind },
            ].map(({ label, icon: Icon, color, bg, action }) => (
              <button
                key={label}
                onClick={action}
                disabled={isPending}
                className={`flex flex-col items-center gap-1.5 ${bg} rounded-2xl p-3 active:scale-95 transition-transform duration-100`}
              >
                <Icon size={18} className={color} />
                <span className="text-[10px] text-[#94A3B8] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1E1E30] mx-4 mb-4">
        {(["overview", "billing", "attendance"] as TabType[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-[#6366F1] text-[#6366F1]"
                : "border-transparent text-[#94A3B8] hover:text-[#F1F5F9]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-4 space-y-3">
        {tab === "overview" && (
          <>
            {/* Info */}
            <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Member Info</p>
              {[
                { label: "Joining Date", value: formatDate(member.joining_date) },
                { label: "Email", value: member.email || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">{label}</span>
                  <span className="text-[#F1F5F9] font-medium">{value}</span>
                </div>
              ))}
              {member.notes && (
                <p className="text-xs text-[#94A3B8] border-t border-[#1E1E30] pt-2">{member.notes}</p>
              )}
            </div>

            {/* Current Plan */}
            {member.subscription_id ? (
              <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Current Plan</p>
                  <span className="text-xs font-semibold text-[#6366F1]">{member.plan_name}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#94A3B8]">
                    {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Expired"}
                  </span>
                  <span className="text-[#F1F5F9] font-medium">{formatDate(member.end_date)}</span>
                </div>
                <div className="h-2 bg-[#1C1C2E] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#6366F1] rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4 text-center">
                <p className="text-sm text-[#94A3B8] mb-3">No active plan</p>
                <button
                  onClick={() => setShowPlan(true)}
                  className="h-12 px-4 rounded-xl bg-[#6366F1] text-white text-sm font-semibold active:scale-95 transition-transform duration-100"
                >
                  Add Plan
                </button>
              </div>
            )}

            {/* Subscription History */}
            {subscriptions.length > 1 && (
              <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4">
                <button
                  onClick={() => setShowSubHistory(!showSubHistory)}
                  className="w-full flex items-center justify-between"
                >
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Subscription History</p>
                  {showSubHistory ? <ChevronUp size={16} className="text-[#94A3B8]" /> : <ChevronDown size={16} className="text-[#94A3B8]" />}
                </button>
                {showSubHistory && (
                  <div className="mt-3 space-y-2">
                    {subscriptions.map(s => {
                      const plan = plans.find(p => p.id === s.plan_id);
                      return (
                        <div key={s.id} className="bg-[#1C1C2E] rounded-xl p-3 flex justify-between text-sm">
                          <span className="text-[#F1F5F9] font-medium">{plan?.name ?? "Plan"}</span>
                          <span className="text-[#94A3B8]">{formatDate(s.start_date)} — {formatDate(s.end_date)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Freeze Toggle */}
            <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#F1F5F9]">Freeze Membership</p>
                <p className="text-xs text-[#94A3B8]">Pause billing and access</p>
              </div>
              <button
                onClick={handleFreeze}
                disabled={isPending}
                className={`h-12 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform duration-100 ${
                  member.is_frozen
                    ? "bg-blue-900/30 text-blue-400"
                    : "bg-[#1C1C2E] text-[#94A3B8]"
                }`}
              >
                <Snowflake size={14} />
                {member.is_frozen ? "Unfreeze" : "Freeze"}
              </button>
            </div>
          </>
        )}

        {tab === "billing" && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Invoiced", value: formatINR(member.total_invoiced ?? 0), color: "text-[#F1F5F9]" },
                { label: "Paid", value: formatINR(member.total_paid ?? 0), color: "text-[#22C55E]" },
                { label: "Due", value: formatINR(member.balance_due ?? 0), color: (member.balance_due ?? 0) > 0 ? "text-[#EF4444]" : "text-[#22C55E]" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-3 text-center">
                  <p className="text-xs text-[#94A3B8] mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPayment(true)}
              className="w-full h-12 rounded-xl bg-[#6366F1] text-white font-semibold active:scale-95 transition-transform duration-100"
            >
              Record Payment
            </button>

            {/* Invoices */}
            {invoices.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-2">Invoices</p>
                <div className="space-y-2">
                  {invoices.map(inv => (
                    <div key={inv.id} className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#F1F5F9]">{inv.invoice_number}</p>
                        <p className="text-xs text-[#94A3B8]">{formatDate(inv.created_at)}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#F1F5F9]">{formatINR(inv.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payments */}
            {payments.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-2">Payments</p>
                <div className="space-y-2">
                  {payments.map(p => (
                    <div key={p.id} className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#F1F5F9]">{p.receipt_number}</p>
                        <p className="text-xs text-[#94A3B8]">{p.payment_method} · {formatDate(p.paid_at)}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#22C55E]">{formatINR(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "attendance" && (
          <>
            {/* Day Grid */}
            <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-3">
                {now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
              <div className="grid grid-cols-7 gap-1.5">
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <div key={i} className="h-7 flex items-center justify-center text-[10px] text-[#94A3B8] font-medium">{d}</div>
                ))}
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const attended = attendedDays.has(day);
                  const isToday = day === now.getDate();
                  return (
                    <div
                      key={day}
                      className={`h-7 rounded-lg flex items-center justify-center text-xs font-medium ${
                        attended
                          ? "bg-[#6366F1] text-white"
                          : isToday
                          ? "bg-[#1C1C2E] text-[#F1F5F9] border border-[#6366F1]/50"
                          : "bg-[#1C1C2E] text-[#94A3B8]"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-2">
                Check-in History ({attendance.length})
              </p>
              {attendance.length === 0 ? (
                <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-6 text-center">
                  <p className="text-sm text-[#94A3B8]">No check-ins yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attendance.map(a => (
                    <div key={a.id} className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-3 flex justify-between">
                      <span className="text-sm text-[#F1F5F9]">{formatDate(a.checked_in_at)}</span>
                      <span className="text-xs text-[#94A3B8]">
                        {new Date(a.checked_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog for expired/lapsed check-in */}
      {showConfirmCheckin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmCheckin(false)} />
          <div className="relative bg-[#13131F] border border-[#1E1E30] rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#EF4444]/15 flex items-center justify-center">
                <AlertCircle size={20} className="text-[#EF4444]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#F1F5F9]">Expired Subscription</h3>
                <p className="text-sm text-[#94A3B8]">This member&apos;s subscription has expired. Check in anyway?</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmCheckin(false)}
                className="flex-1 h-12 rounded-xl bg-[#1C1C2E] text-[#94A3B8] font-semibold active:scale-95 transition-transform duration-100"
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

      {/* Payment Sheet */}
      <BottomSheet open={showPayment} onClose={() => setShowPayment(false)} title="Record Payment">
        <form onSubmit={handlePayment} className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Amount (₹)</label>
            <input
              type="number"
              required
              min="1"
              value={payForm.amount}
              onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
              className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#94A3B8] block mb-2">Payment Method</label>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPayForm(p => ({ ...p, method: m }))}
                  className={`h-12 rounded-xl text-sm font-medium transition-colors ${
                    payForm.method === m
                      ? "bg-[#6366F1] text-white"
                      : "bg-[#1C1C2E] text-[#94A3B8] border border-[#1E1E30]"
                  }`}
                >
                  {METHOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
          {invoices.length > 0 && (
            <div>
              <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Link Invoice (optional)</label>
              <select
                value={payForm.invoice_id}
                onChange={e => setPayForm(p => ({ ...p, invoice_id: e.target.value }))}
                className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] text-sm"
              >
                <option value="">No invoice</option>
                {invoices.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.invoice_number} — {formatINR(inv.amount)}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Notes</label>
            <input
              type="text"
              value={payForm.notes}
              onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Optional"
              className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-[#6366F1] text-white font-semibold active:scale-95 transition-transform duration-100 disabled:opacity-60"
          >
            {isPending ? "Recording..." : "Record Payment"}
          </button>
        </form>
      </BottomSheet>

      {/* Add Plan Sheet */}
      <BottomSheet open={showPlan} onClose={() => setShowPlan(false)} title="Add Plan">
        <form onSubmit={handleAddPlan} className="space-y-4 pt-2">
          {plans.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-[#94A3B8] mb-3">No active plans available.</p>
              <Link href="/plans" className="text-[#6366F1] text-sm font-medium">Create a plan</Link>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Select Plan</label>
                <select
                  required
                  value={planForm.plan_id}
                  onChange={e => setPlanForm(p => ({ ...p, plan_id: e.target.value }))}
                  className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] text-sm"
                >
                  {plans.map(pl => (
                    <option key={pl.id} value={pl.id}>{pl.name} — {pl.duration_days} days — {formatINR(pl.price)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Start Date</label>
                <input
                  type="date"
                  required
                  value={planForm.start_date}
                  onChange={e => setPlanForm(p => ({ ...p, start_date: e.target.value }))}
                  className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full h-12 rounded-xl bg-[#6366F1] text-white font-semibold active:scale-95 transition-transform duration-100 disabled:opacity-60"
              >
                {isPending ? "Adding..." : "Add Plan"}
              </button>
            </>
          )}
        </form>
      </BottomSheet>
    </div>
  );
}
