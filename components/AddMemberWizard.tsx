/* eslint-disable @next/next/no-img-element */

"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { addDays, format } from "date-fns";
import {
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createMembershipSaleAction } from "@/app/actions/members";
import { getTodayDateInput, formatINR } from "@/lib/helpers";
import { buildWhatsappUrl } from "@/lib/phone";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
}

interface AddMemberWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  gymId: string;
  plans: Plan[];
}

interface StepIndicatorProps {
  step: number;
}

const FORM_ID = "add-member-wizard-form";

function StepIndicator({ step }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[2px] bg-hover z-0" />
      {[
        { num: 1, label: "Profile", icon: User },
        { num: 2, label: "Tier", icon: Sparkles },
        { num: 3, label: "Billing", icon: CreditCard },
      ].map((item) => {
        const isActive = step === item.num;
        const isPast = step > item.num;
        const Icon = item.icon;

        return (
          <div key={item.num} className="flex flex-col items-center flex-1 relative z-10">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-500 shadow-sm ${
                isPast
                  ? "bg-accent text-white"
                  : isActive
                    ? "bg-accent text-white ring-4 ring-accent/10"
                    : "bg-white text-text-muted border-2 border-border"
              }`}
            >
              {isPast ? <Check size={14} strokeWidth={3} /> : <Icon size={14} strokeWidth={2.5} />}
            </div>
            <span
              className={`mt-2 text-[8px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                isActive ? "text-accent" : "text-text-muted"
              }`}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AddMemberWizard({ isOpen, onClose, onSuccess, gymId, plans }: AddMemberWizardProps) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isFullPayment, setIsFullPayment] = useState(true);
  const [customAmount, setCustomAmount] = useState("");
  const [successData, setSuccessData] = useState<{ name: string; planName: string; expiry: string } | null>(null);

  const popularPlanId = plans.length > 0 ? plans[Math.floor(plans.length / 2)].id : "";
  const defaultDate = getTodayDateInput();
  const [selectedPlanId, setSelectedPlanId] = useState(popularPlanId);
  const [startDate, setStartDate] = useState(defaultDate);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const totalFee = selectedPlan?.price ?? 0;
  const amountPaid = isFullPayment ? totalFee : Number(customAmount) || 0;

  let expiresOn = "";
  if (selectedPlan && startDate) {
    try {
      expiresOn = format(addDays(new Date(`${startDate}T00:00:00+05:30`), selectedPlan.duration_days), "MMM d, yyyy");
    } catch {
      expiresOn = "";
    }
  }

  const resetWizard = useCallback(() => {
    setStep(1);
    setFullName("");
    setPhone("");
    setPhotoUrl("");
    setDeviceId("");
    setSelectedPlanId(popularPlanId);
    setStartDate(defaultDate);
    setPaymentMethod("cash");
    setIsFullPayment(true);
    setCustomAmount("");
    setSuccessData(null);
  }, [defaultDate, popularPlanId]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      resetWizard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isOpen, resetWizard]);

  const [lastStepChange, setLastStepChange] = useState(0);

  function handleNextToPlan() {
    if (!fullName || phone.length !== 10) {
      toast.error("Please enter a valid name and 10-digit phone number");
      return;
    }

    setStep(2);
    setLastStepChange(Date.now());
  }

  function handleNextToPayment() {
    if (!selectedPlanId) {
      toast.error("Please select a plan");
      return;
    }

    setStep(3);
    setLastStepChange(Date.now());
  }

  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    
    if (step === 1) {
      handleNextToPlan();
      return;
    }
    
    if (step === 2) {
      handleNextToPayment();
      return;
    }

    // Prevent accidental double-click submission from step 2 to step 3
    if (Date.now() - lastStepChange < 500) {
      return;
    }

    if (isPending || submitting) return;

    setSubmitting(true);
    startTransition(async () => {
      try {
        await createMembershipSaleAction({
          gym_id: gymId,
          full_name: fullName,
          phone,
          deviceEnrollmentId: deviceId,
          photoUrl,
          planId: selectedPlanId,
          startDate: startDate || defaultDate,
          paymentMethod: paymentMethod as "cash" | "upi" | "card" | "bank_transfer",
          amountPaid,
        });

        // Trigger success callback to refresh parent list
        onSuccess?.();

        setSuccessData({
          name: fullName,
          planName: selectedPlan?.name || "",
          expiry: expiresOn,
        });
        setStep(4);

        window.setTimeout(() => {
          if (isOpen) onClose();
        }, 8000);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setSubmitting(false);
      }
    });
  }

  const receiptUrl =
    successData &&
    buildWhatsappUrl(
      phone,
      `Hi ${successData.name.split(" ")[0]}, welcome to the gym! Your ${successData.planName} membership is active until ${successData.expiry}. See you at the gym!`
    );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full h-full md:h-auto md:max-w-[500px] p-0 overflow-hidden md:rounded-[2rem] border-none shadow-2xl bg-white animate-fade-up">
        <DialogHeader className="hidden">
          <DialogTitle>Membership Orchestration</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full bg-white overflow-hidden">
          {step < 4 && <StepIndicator step={step} />}

          <form id={FORM_ID} onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-page">
            <div className="p-5 md:p-8 space-y-5 md:space-y-6 pb-20 md:pb-8">
              {step === 1 && (
                <div className="space-y-6 animate-fade-up">
                  <div className="bg-white p-5 rounded-[1.5rem] border-2 border-border shadow-sm flex items-center gap-5">
                    <div className="relative group">
                      <ImageUpload 
                        value={photoUrl} 
                        onChange={setPhotoUrl} 
                        className="h-20 w-20"
                      />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">Member Portrait</h3>
                      <p className="text-[10px] text-text-secondary font-medium mt-1">Visual verification ID</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1">Identity Designation</label>
                      <input
                        required
                        placeholder="e.g. Vikram Singh"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        className="w-full h-12 bg-white border-2 border-border rounded-xl px-5 text-sm text-text-primary font-bold placeholder:text-text-muted/50 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1">Primary Contact (WhatsApp)</label>
                      <div className="relative">
                        <input
                          required
                          type="tel"
                          maxLength={10}
                          placeholder="10-digit mobile number"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                          className={`w-full h-12 bg-white border-2 rounded-xl px-5 text-sm text-text-primary font-bold font-mono outline-none transition-all shadow-sm ${
                            phone.length > 0 && phone.length < 10
                              ? "border-status-warning-border ring-4 ring-status-warning-bg bg-status-warning-bg/10"
                              : "border-border focus:border-accent focus:ring-4 focus:ring-accent/5"
                          }`}
                        />
                        {phone.length === 10 && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-status-success-text">
                            <ShieldCheck size={18} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1">Terminal Enrollment ID</label>
                      <input
                        placeholder="e.g. 1024"
                        value={deviceId}
                        onChange={(event) => setDeviceId(event.target.value)}
                        className="w-full h-12 bg-white border-2 border-border rounded-xl px-5 text-sm text-text-primary font-bold font-mono placeholder:text-text-muted/50 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-fade-up">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">Select Subscription</h3>
                    <span className="text-[8px] font-bold bg-accent-light text-accent-text px-2 py-0.5 rounded-full border border-accent-border uppercase tracking-widest">
                      {plans.length} Tiers
                    </span>
                  </div>

                  <div className="grid gap-3">
                    {plans.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      const isPopular = plan.id === popularPlanId;

                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`group w-full rounded-xl p-4 flex items-center justify-between border-2 transition-all relative overflow-hidden ${
                            isSelected
                              ? "bg-white border-accent shadow-lg ring-4 ring-accent/5"
                              : "bg-white/60 border-border hover:border-border-strong hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3 relative z-10">
                            <div
                              className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${
                                isSelected ? "bg-accent text-white" : "bg-page text-text-muted border border-border"
                              }`}
                            >
                              <Sparkles size={16} />
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-xs font-bold uppercase tracking-wide ${isSelected ? "text-accent-text" : "text-text-primary"}`}>
                                  {plan.name}
                                </h4>
                                {isPopular && (
                                  <span className="bg-accent text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                                    Best
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] font-bold text-text-muted mt-0.5 uppercase tracking-widest">{plan.duration_days} Days</p>
                            </div>
                          </div>
                          <div className="text-right relative z-10">
                            <span className={`text-lg font-mono font-bold tracking-tighter ${isSelected ? "text-accent-text" : "text-text-primary"}`}>
                              {formatINR(plan.price)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 md:p-5 rounded-[1.2rem] md:rounded-[1.5rem] border-2 border-border shadow-sm">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">Onboarding Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="w-full h-11 bg-page border-2 border-border rounded-xl px-4 text-[11px] text-text-primary font-bold focus:border-accent outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">Expiry Forecast</label>
                      <div className="w-full h-11 bg-hover border-2 border-border rounded-xl px-4 text-[11px] text-text-secondary font-bold flex items-center">
                        {expiresOn}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-fade-up">
                  <div className="bg-white border-2 border-border rounded-[1.5rem] overflow-hidden shadow-sm">
                    <div className="bg-accent-light p-5 border-b-2 border-accent-border flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-bold text-accent-text uppercase tracking-[0.2em] mb-0.5">Active Selection</p>
                        <p className="text-xs font-bold text-accent-text">{selectedPlan?.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="h-7 w-7 bg-white rounded-lg flex items-center justify-center text-accent shadow-sm border border-accent-border hover:bg-accent hover:text-white transition-all"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    <div className="p-6 space-y-5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Base Subscription Fee</span>
                        <span className="text-base font-mono font-bold text-text-primary">{formatINR(totalFee)}</span>
                      </div>

                      <div className="flex justify-between items-center bg-page p-3 rounded-xl border border-border">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${isFullPayment ? "bg-accent text-white" : "bg-white text-text-muted border border-border"}`}>
                            <Check size={14} strokeWidth={3} />
                          </div>
                          <span className="text-[9px] font-bold text-text-primary uppercase tracking-widest">Full Payment</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsFullPayment(!isFullPayment)}
                          className={`w-10 h-5 rounded-full transition-all relative ${isFullPayment ? "bg-accent shadow-lg shadow-accent/20" : "bg-border"}`}
                        >
                          <div className={`absolute top-0.5 bottom-0.5 w-3.5 bg-white rounded-full transition-all shadow-sm ${isFullPayment ? "left-6" : "left-0.5"}`} />
                        </button>
                      </div>

                      {!isFullPayment && (
                        <div className="space-y-3 animate-fade-in">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">Collected Amount</label>
                            <input
                              type="number"
                              placeholder="Enter custom amount"
                              value={customAmount}
                              onChange={(event) => setCustomAmount(event.target.value)}
                              className="w-full h-12 bg-white border-2 border-border rounded-xl px-5 text-sm text-text-primary font-bold font-mono focus:border-accent outline-none shadow-inner"
                            />
                          </div>
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-bold text-status-danger-text uppercase tracking-widest">Balance Due</span>
                            <span className="text-[11px] font-mono font-bold text-status-danger-text">{formatINR(Math.max(0, totalFee - (Number(customAmount) || 0)))}</span>
                          </div>
                        </div>
                      )}

                      <div className="pt-5 border-t-2 border-dashed border-border flex justify-between items-center">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">Collection</p>
                          <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest">{paymentMethod} Trans.</p>
                        </div>
                        <span className="text-2xl font-mono font-bold text-accent tracking-tighter">{formatINR(amountPaid)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">Channel Selection</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["Cash", "UPI", "Card", "Bank"].map((mode) => {
                        const normalized = mode === "Bank" ? "bank_transfer" : mode.toLowerCase();
                        const isSelected = paymentMethod === normalized;

                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setPaymentMethod(normalized)}
                            className={`h-9 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border-2 ${
                              isSelected
                                ? "bg-accent text-white border-accent shadow-md scale-105"
                                : "bg-white text-text-muted border-border hover:border-border-strong"
                            }`}
                          >
                            {mode}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && successData && (
                <div className="py-10 flex flex-col items-center justify-center text-center animate-fade-up">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center border-8 border-accent-light shadow-xl animate-bounce">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    <h2 className="text-[9px] font-bold text-text-muted uppercase tracking-[0.4em]">Onboarded</h2>
                    <p className="text-2xl font-bold text-text-primary tracking-tight">{successData.name}</p>
                    <div className="inline-flex items-center gap-2 bg-white border border-border px-3 py-1 rounded-full shadow-sm">
                      <span className="text-[9px] font-bold text-accent uppercase tracking-widest">{successData.planName}</span>
                    </div>
                  </div>

                  <div className="w-full space-y-3">
                    {receiptUrl && (
                      <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full h-12 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-bold transition-all gap-2 shadow-lg shadow-[#25D366]/20 uppercase text-[10px] tracking-[0.1em]"
                      >
                        <MessageCircle size={18} />
                        Send Receipt
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={resetWizard}
                      className="flex items-center justify-center w-full h-12 bg-white border-2 border-border text-text-primary hover:bg-hover rounded-xl font-bold transition-all uppercase text-[10px] tracking-[0.1em]"
                    >
                      Next Member
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>

          {step < 4 && (
            <div className="p-4 md:p-6 border-t border-border bg-white flex gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="h-12 px-4 bg-white border-2 border-border text-text-muted rounded-xl font-bold hover:bg-hover transition-all"
                >
                  <ChevronRight size={18} className="rotate-180" />
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={step === 2 ? handleNextToPayment : handleNextToPlan}
                  disabled={isPending || submitting}
                  className="flex-1 h-12 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-[0.1em] text-[11px] shadow-lg shadow-accent/20 disabled:opacity-50"
                >
                  {isPending || submitting ? "Processing..." : step === 1 ? "Next: Select Tier" : "Next: Billing"}
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              ) : (
                <button
                  type="submit"
                  form={FORM_ID}
                  disabled={isPending || submitting}
                  className="flex-1 h-12 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-[0.1em] text-[11px] shadow-lg shadow-accent/20 disabled:opacity-50"
                >
                  {isPending || submitting ? "Processing..." : "Finish Enrollment"}
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
