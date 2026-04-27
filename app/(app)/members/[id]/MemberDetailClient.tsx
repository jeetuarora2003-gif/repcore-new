"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Calendar, FileText, History, IndianRupee, Loader2, Phone, ScanLine, ShieldAlert, Zap } from "lucide-react";
import { addSubscription, recordPayment } from "@/app/actions/subscriptions";
import { checkIn } from "@/app/actions/attendance";
import { markReminderSent } from "@/app/actions/reminders";
import BottomSheet from "@/components/BottomSheet";
import MemberAvatar from "@/components/MemberAvatar";
import { buildWhatsappUrl } from "@/lib/phone";
import { formatDate, formatINR, getTodayDateInput, isSameDayInTimeZone, statusBadgeClass, statusLabel, toDateKey } from "@/lib/helpers";
import type { Attendance, Gym, Invoice, MemberStatus, Payment, Plan } from "@/lib/supabase/types";
import type { MemberStatusType } from "@/lib/helpers";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSWRConfig } from "swr";

interface Props {
  gym: Gym;
  member: MemberStatus;
  invoices: Invoice[];
  payments: Payment[];
  attendance: Attendance[];
  plans: Plan[];
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


export default function MemberDetailClient({ gym, member, invoices, payments, attendance, plans }: Props) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [tab, setTab] = useState<TabType>("overview");
  const [showPayment, setShowPayment] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showConfirmCheckin, setShowConfirmCheckin] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const [payForm, setPayForm] = useState({
    amount: String(Math.max(0, member.balance_due ?? 0)),
    method: "cash" as PaymentMethod,
    notes: "",
    invoice_id: "",
  });

  const [planForm, setPlanForm] = useState({
    plan_id: plans[0]?.id ?? "",
    start_date: getTodayDateInput(),
    isPaid: true,
    paymentMethod: "cash" as PaymentMethod,
    notes: "",
  });

  const isExpiredOrLapsed = member.status === "expired" || member.status === "lapsed";

  function handleCheckIn() {
    if (isCheckingIn || isPending) return;
    
    if (isExpiredOrLapsed) {
      setShowConfirmCheckin(true);
      return;
    }

    doCheckIn();
  }

  async function doCheckIn() {
    if (isCheckingIn) return;
    setIsCheckingIn(true);
    setShowConfirmCheckin(false);
    
    try {
      await checkIn(member.id, member.gym_id);
      toast.success("Checked in successfully!");
      // Instant SWR refresh
      mutate(`/api/members/${member.id}`);
      mutate("/api/dashboard");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsCheckingIn(false);
    }
  }

  function handlePayment(event: React.FormEvent) {
    event.preventDefault();

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
        mutate(`/api/members/${member.id}`);
        mutate("/api/dashboard");
        router.refresh();
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  function handleAddPlan(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const result = await addSubscription(member.id, planForm.plan_id, planForm.start_date, gym.id);
        
        if (planForm.isPaid) {
          const plan = plans.find(p => p.id === planForm.plan_id);
          try {
            await recordPayment({
              gym_id: gym.id,
              member_id: member.id,
              invoice_id: result.invoice_id,
              amount: plan?.price ?? 0,
              payment_method: planForm.paymentMethod,
              notes: planForm.notes || "Plan payment",
            });
            toast.success("Plan added and payment recorded!");
          } catch (payError) {
            console.error("Payment error:", payError);
            toast.error("Plan added, but payment recording failed. Please record payment manually from the Billing tab.");
          }
        } else {
          toast.success("Plan added!");
        }

        setShowPlan(false);
        mutate(`/api/members/${member.id}`);
        mutate("/api/dashboard");
        router.refresh();
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  function openRenewPlan() {
    if (!member.end_date) {
      setShowPlan(true);
      return;
    }

    const currentEndDate = new Date(member.end_date);
    const today = new Date();
    
    // If already expired, start from today. If active, start from day after expiry.
    const nextStart = currentEndDate < today ? today : new Date(currentEndDate.getTime() + 24 * 60 * 60 * 1000);
    
    setPlanForm(prev => ({
      ...prev,
      start_date: toDateKey(nextStart),
      plan_id: plans.find(p => p.name === member.plan_name)?.id ?? plans[0]?.id ?? "",
      isPaid: true,
    }));
    setShowPlan(true);
  }

  function handleRemind() {
    if (!member.subscription_id) {
      toast.error("No active subscription to remind about");
      return;
    }

    const whatsappUrl = buildWhatsappUrl(
      member.phone,
      `Hi ${member.full_name}! Your ${member.plan_name ?? "membership"} at ${gym.name} expires on ${formatDate(member.end_date)}. Renew now to continue your fitness journey! Call or WhatsApp us: ${gym.phone}`
    );

    if (!whatsappUrl) {
      toast.error("This member does not have a valid phone number.");
      return;
    }

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    startTransition(async () => {
      const result = await markReminderSent(member.id, member.subscription_id!, 1, gym.id);
      if (!result.success) {
        toast.error(result.error ?? "Could not save reminder history.");
      }
    });
  }

  const daysRemaining = member.days_until_expiry ?? 0;
  const planDuration = member.duration_days ?? plans.find((plan) => plan.name === member.plan_name)?.duration_days ?? 30;
  const progress =
    member.start_date && member.end_date
      ? Math.min(100, Math.max(0, (daysRemaining / planDuration) * 100))
      : 0;

  const checkedInToday = attendance.some((entry) => isSameDayInTimeZone(entry.checked_in_at, new Date()));

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOffset = new Date(currentYear, currentMonth, 1).getDay();
  const attendedDays = new Set(
    attendance
      .filter((entry) => {
        const date = new Date(entry.checked_in_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .map((entry) => new Date(entry.checked_in_at).getDate())
  );

  return (
    <div className="space-y-8 animate-fade-up">
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

            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              <button
                onClick={handleCheckIn}
                disabled={checkedInToday || isPending || isCheckingIn}
                className={`h-10 px-5 rounded-full flex items-center gap-2 text-xs font-bold transition-all ${
                  checkedInToday
                    ? "bg-hover text-text-muted border border-border cursor-not-allowed"
                    : (isPending || isCheckingIn)
                      ? "bg-accent/50 text-white cursor-wait"
                      : "bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent-hover active:scale-95"
                }`}
              >
                {isPending || isCheckingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ScanLine size={16} />
                )}
                {checkedInToday ? "Checked In" : (isPending || isCheckingIn) ? "Processing..." : "Quick Check-in"}
              </button>
              {member.subscription_id ? (
                <button
                  onClick={openRenewPlan}
                  className="h-10 px-5 rounded-full bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-all active:scale-95 shadow-lg shadow-accent/20"
                >
                  Renew Plan
                </button>
              ) : null}
              <button
                onClick={() => {
                  setPlanForm(prev => ({ ...prev, isPaid: true }));
                  setShowPlan(true);
                }}
                className="h-10 px-5 rounded-full bg-white border border-border text-text-primary text-xs font-bold hover:bg-hover hover:border-border-strong transition-all active:scale-95 shadow-sm"
              >
                {member.subscription_id ? "Change Plan" : "Assign Plan"}
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
        <div className="sticky top-[56px] z-20 py-2 bg-page/80 backdrop-blur-md">
          <Tabs value={tab} onValueChange={(value: string) => setTab(value as TabType)}>
            <TabsList className="bg-white border border-border w-full flex">
              {(["overview", "billing", "attendance"] as TabType[]).map((item) => (
                <TabsTrigger key={item} value={item} className="flex-1 capitalize">
                  {item}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-8">
          {tab === "overview" && (
            <div className="grid md:grid-cols-2 gap-6">
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
                          {daysRemaining > 0 ? `${daysRemaining} Days Left` : daysRemaining === 0 ? "Expires Today" : `Expired ${Math.abs(daysRemaining)} days ago`}
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

              <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-hover flex items-center justify-center text-text-muted border border-border">
                    <FileText size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Internal Notes</h3>
                </div>
                <div className="bg-page rounded-xl p-4 border border-border min-h-[100px]">
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">{member.notes || "No additional notes for this member."}</p>
                </div>
              </div>
            </div>
          )}

          {tab === "billing" && (
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Invoiced", value: formatINR(member.total_invoiced ?? 0), color: "text-text-primary" },
                  { label: "Paid", value: formatINR(member.total_paid ?? 0), color: "text-status-success-text" },
                  {
                    label: "Due",
                    value: formatINR(member.balance_due ?? 0),
                    color: (member.balance_due ?? 0) > 0 ? "text-status-danger-text" : "text-status-success-text",
                  },
                ].map((item) => (
                  <div key={item.label} className="bg-white border border-border rounded-2xl p-5 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`text-xl font-bold font-mono tracking-tighter ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

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
                      payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 hover:bg-hover transition-colors">
                          <div>
                            <p className="text-sm font-bold text-text-primary">{METHOD_LABELS[payment.payment_method as PaymentMethod]}</p>
                            <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-wider">{formatDate(payment.paid_at)}</p>
                          </div>
                          <span className="text-sm font-bold font-mono text-status-success-text">+{formatINR(payment.amount)}</span>
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
                      invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 hover:bg-hover transition-colors">
                          <div>
                            <p className="text-sm font-bold text-text-primary">#{invoice.invoice_number}</p>
                            <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-wider">{formatDate(invoice.created_at)}</p>
                          </div>
                          <span className="text-sm font-bold font-mono text-text-primary">{formatINR(invoice.amount)}</span>
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
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="h-8 flex items-center justify-center text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: firstDayOffset }).map((_, index) => (
                      <div key={`empty-${index}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1;
                      const attended = attendedDays.has(day);
                      const isToday = day === now.getDate();

                      return (
                        <div
                          key={day}
                          className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-all border ${
                            attended
                              ? "bg-accent border-accent text-white shadow-md shadow-accent/20 scale-105 z-10"
                              : isToday
                                ? "border-accent text-accent ring-2 ring-accent/10"
                                : "bg-page border-border text-text-muted hover:border-border-strong hover:bg-hover"
                          }`}
                        >
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
                    attendance.map((entry) => (
                      <div key={entry.id} className="p-4 flex justify-between items-center hover:bg-hover transition-colors">
                        <span className="text-xs font-bold text-text-primary font-mono">{formatDate(entry.checked_in_at)}</span>
                        <span className="text-[11px] text-text-muted font-bold font-mono uppercase">
                          {new Date(entry.checked_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
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

      <BottomSheet open={showPayment} onClose={() => setShowPayment(false)} title="Record New Payment">
        <form onSubmit={handlePayment} className="space-y-6 pt-4 pb-8">
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Payment Amount (INR)</label>
            <input
              type="number"
              required
              value={payForm.amount}
              onChange={(event) => setPayForm((current) => ({ ...current, amount: event.target.value }))}
              className="w-full h-12 rounded-xl bg-page border border-border px-4 text-sm text-text-primary font-bold font-mono focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-3">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPayForm((current) => ({ ...current, method }))}
                  className={`h-11 rounded-xl text-xs font-bold transition-all border ${
                    payForm.method === method
                      ? "bg-accent-light border-accent/40 text-accent-text shadow-sm"
                      : "bg-white border-border text-text-muted hover:bg-hover hover:border-border-strong"
                  }`}
                >
                  {METHOD_LABELS[method]}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={isPending} className="w-full h-12 rounded-xl bg-accent text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-50 mt-4 shadow-lg shadow-accent/20 uppercase tracking-widest">
            Record Transaction
          </button>
        </form>
      </BottomSheet>

      <BottomSheet open={showPlan} onClose={() => setShowPlan(false)} title="Assign New Plan">
        <form onSubmit={handleAddPlan} className="space-y-6 pt-4 pb-8">
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Membership Plan</label>
            <select
              value={planForm.plan_id}
              onChange={(event) => setPlanForm((current) => ({ ...current, plan_id: event.target.value }))}
              className="w-full h-12 rounded-xl bg-page border border-border px-4 text-sm text-text-primary font-bold focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.duration_days} days - {formatINR(plan.price)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Activation Date</label>
            <input
              type="date"
              value={planForm.start_date}
              onChange={(event) => setPlanForm((current) => ({ ...current, start_date: event.target.value }))}
              className="w-full h-12 rounded-xl bg-page border border-border px-4 text-sm text-text-primary font-bold focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none"
            />
          </div>

          <div className="space-y-4 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={planForm.isPaid}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, isPaid: e.target.checked }))}
                  className="peer appearance-none w-5 h-5 rounded-md border-2 border-border checked:bg-accent checked:border-accent transition-all cursor-pointer"
                />
                <Zap size={10} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" strokeWidth={3} />
              </div>
              <span className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors">Payment Done?</span>
            </label>

            {planForm.isPaid && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-3">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPlanForm((current) => ({ ...current, paymentMethod: method }))}
                        className={`h-11 rounded-xl text-xs font-bold transition-all border ${
                          planForm.paymentMethod === method
                            ? "bg-accent-light border-accent/40 text-accent-text shadow-sm"
                            : "bg-white border-border text-text-muted hover:bg-hover hover:border-border-strong"
                        }`}
                      >
                        {METHOD_LABELS[method]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Internal Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Received by Coach Rohit"
                    value={planForm.notes}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full h-11 rounded-xl bg-page border border-border px-4 text-xs text-text-primary font-medium focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={isPending} className="w-full h-12 rounded-xl bg-accent text-white text-sm font-bold active:scale-[0.98] transition-all mt-4 shadow-lg shadow-accent/20 uppercase tracking-widest">
            {planForm.isPaid ? "Confirm & Record Payment" : "Confirm Plan Change"}
          </button>
        </form>
      </BottomSheet>

      {showConfirmCheckin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-sidebar/80 backdrop-blur-sm" onClick={() => setShowConfirmCheckin(false)} />
          <div className="relative bg-white border-2 border-border rounded-[2.5rem] p-10 max-w-sm w-full animate-fade-up shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-status-danger-bg flex items-center justify-center text-status-danger-text border border-status-danger-border">
                <ShieldAlert size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-text-primary uppercase tracking-tight">Expired Credentials</h3>
                <p className="text-xs text-text-secondary font-medium leading-relaxed">
                  This member&apos;s subscription has expired. Do you want to override and check them in anyway?
                </p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={doCheckIn}
                  disabled={isPending}
                  className="h-12 rounded-xl bg-status-danger-text text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-status-danger-text/20 transition-all active:scale-95"
                >
                  Override & Check In
                </button>
                <button
                  onClick={() => setShowConfirmCheckin(false)}
                  className="h-12 rounded-xl bg-white border-2 border-border text-text-muted text-[10px] font-bold uppercase tracking-widest hover:bg-hover transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
