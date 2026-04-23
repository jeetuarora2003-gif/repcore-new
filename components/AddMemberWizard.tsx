"use client";

import { useState, useTransition, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Check, Camera, Search, User, CreditCard, ChevronRight, CheckCircle2, MessageCircle } from "lucide-react";
import BottomSheet from "@/components/BottomSheet";
import { createMembershipSaleAction } from "@/app/actions/members";
import { toast } from "sonner";
import { formatINR } from "@/lib/helpers";

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
}

interface AddMemberWizardProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  plans: Plan[];
}

export default function AddMemberWizard({ isOpen, onClose, gymId, plans }: AddMemberWizardProps) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [deviceId, setDeviceId] = useState("");

  const popularPlanId = plans.length > 0 ? plans[Math.floor(plans.length / 2)].id : ""; // Mock popular plan
  const [selectedPlanId, setSelectedPlanId] = useState(popularPlanId);
  
  const defaultDate = format(new Date(), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState(defaultDate);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isFullPayment, setIsFullPayment] = useState(true);
  const [customAmount, setCustomAmount] = useState("");

  const [successData, setSuccessData] = useState<{ name: string; planName: string; expiry: string } | null>(null);

  // Derived state
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const totalFee = selectedPlan?.price || 0;
  const amountPaid = isFullPayment ? totalFee : (Number(customAmount) || 0);

  let expiresOn = "";
  if (selectedPlan && startDate) {
    try {
      const start = new Date(startDate);
      const end = addDays(start, selectedPlan.duration_days);
      expiresOn = format(end, "MMM d, yyyy");
    } catch (e) {
      // ignore invalid dates while typing
    }
  }

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, popularPlanId, defaultDate]);

  function handleNextToPlan() {
    if (!fullName || phone.length !== 10) {
      toast.error("Please enter a valid name and 10-digit phone number");
      return;
    }
    setStep(2);
  }

  function handleNextToPayment() {
    if (!selectedPlanId) {
      toast.error("Please select a plan");
      return;
    }
    setStep(3);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;

    startTransition(async () => {
      try {
        await createMembershipSaleAction({
          gym_id: gymId,
          full_name: fullName,
          phone,
          deviceEnrollmentId: deviceId || "",
          photoUrl: photoUrl || "",
          planId: selectedPlanId,
          startDate: startDate || defaultDate,
          paymentMethod: paymentMethod || "cash",
          amountPaid: amountPaid ?? totalFee,
        });
        
        setSuccessData({
          name: fullName,
          planName: selectedPlan?.name || "",
          expiry: expiresOn,
        });
        setStep(4); // Success screen
        
        // Auto close after 5s
        setTimeout(() => {
          if (isOpen && step === 4) {
            onClose();
          }
        }, 5000);
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-white">
      {[
        { num: 1, label: "Profile" },
        { num: 2, label: "Plan" },
        { num: 3, label: "Payment" },
      ].map((s, i) => {
        const isActive = step === s.num;
        const isPast = step > s.num;
        return (
          <div key={s.num} className="flex flex-col items-center flex-1 relative z-10">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              isPast ? "bg-accent text-white" : 
              isActive ? "bg-accent text-white ring-4 ring-accent/15" : 
              "bg-hover text-text-muted border border-border"
            }`}>
              {isPast ? <Check size={16} strokeWidth={3} /> : s.num}
            </div>
            <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-accent" : "text-text-muted"}`}>
              {s.label}
            </span>
            {/* Connecting lines */}
            {i < 2 && (
              <div className={`absolute top-4 left-[60%] w-[80%] h-[2px] -z-10 ${isPast ? "bg-accent" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <BottomSheet open={isOpen} onClose={onClose} title={step === 4 ? "" : "New Member"}>
      {step < 4 && <StepIndicator />}

      <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh] bg-white">
        {/* Hidden inputs */}
        <input type="hidden" name="startDate" value={startDate || defaultDate} />
        <input type="hidden" name="planId" value={selectedPlanId} />
        <input type="hidden" name="paymentMethod" value={paymentMethod || "cash"} />
        <input type="hidden" name="amountPaid" value={amountPaid ?? totalFee} />
        <input type="hidden" name="photoUrl" value={photoUrl || ""} />
        <input type="hidden" name="deviceEnrollmentId" value={deviceId || ""} />

        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-page">
          {/* STEP 1: PROFILE */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex items-center gap-6 bg-white p-4 rounded-2xl border border-border">
                <button type="button" className="h-16 w-16 rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center bg-page hover:bg-hover hover:border-accent/40 transition-all group">
                  <Camera size={20} className="text-text-muted group-hover:text-accent" />
                  <span className="text-[9px] font-bold text-text-muted uppercase mt-1">Add photo</span>
                </button>
                <div className="flex-1">
                  <p className="text-xs font-bold text-text-primary uppercase tracking-wide">Member Photo</p>
                  <p className="text-[11px] text-text-secondary mt-1">Capture member photo for check-in verification</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Full name *</label>
                  <input required placeholder="e.g. Rahul Sharma" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full h-12 bg-white border border-border rounded-xl px-4 text-sm text-text-primary font-semibold focus:border-accent focus:ring-1 focus:ring-accent/15 outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Phone number *</label>
                  <input required type="tel" maxLength={10} placeholder="10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} className="w-full h-12 bg-white border border-border rounded-xl px-4 text-sm text-text-primary font-bold font-mono focus:border-accent focus:ring-1 focus:ring-accent/15 outline-none transition-all shadow-sm" />
                  {phone.length > 0 && phone.length < 10 && <p className="text-status-danger-text text-[10px] font-bold mt-1 uppercase tracking-wider">Invalid Phone Number</p>}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Device Enrollment ID</label>
                  <input placeholder="e.g. 007" value={deviceId} onChange={e => setDeviceId(e.target.value)} className="w-full h-12 bg-white border border-border rounded-xl px-4 text-sm text-text-primary font-bold font-mono focus:border-accent focus:ring-1 focus:ring-accent/15 outline-none transition-all shadow-sm" />
                  <p className="text-[10px] text-text-secondary font-medium mt-1">Required only for biometric fingerprint sync</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PLAN SELECTION */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 block">Membership Plan</label>
                <div className="space-y-3">
                  {plans.map(p => {
                    const isSelected = selectedPlanId === p.id;
                    const isPopular = p.id === popularPlanId;
                    return (
                      <button key={p.id} type="button" onClick={() => setSelectedPlanId(p.id)} className={`w-full min-h-[64px] text-left rounded-xl p-4 flex items-center justify-between border-2 transition-all ${isSelected ? "bg-accent-light border-accent shadow-sm" : "bg-white border-border hover:border-border-strong"}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-bold ${isSelected ? "text-accent-text" : "text-text-primary"}`}>{p.name}</h4>
                            {isPopular && <span className="bg-accent text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Popular</span>}
                          </div>
                          <p className="text-[11px] font-bold text-text-muted mt-0.5 uppercase tracking-wider">{p.duration_days} days</p>
                        </div>
                        <span className={`text-base font-mono font-bold ${isSelected ? "text-accent-text" : "text-text-primary"}`}>{formatINR(p.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Start date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full h-12 bg-white border border-border rounded-xl px-4 text-sm text-text-primary font-bold focus:border-accent focus:outline-none shadow-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Expires on</label>
                  <div className="w-full h-12 bg-hover border border-border rounded-xl px-4 text-sm text-text-secondary font-bold flex items-center">{expiresOn}</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-up">
              {/* Plan Summary Strip */}
              <div className="bg-accent-light border border-accent-border rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-accent-text uppercase tracking-wide">
                    {selectedPlan?.name} <span className="text-accent/30 px-1">|</span> {selectedPlan?.duration_days} days
                  </p>
                  <p className="text-[10px] font-bold text-accent-text/70 uppercase tracking-widest mt-1">Expires {expiresOn}</p>
                </div>
                <button type="button" onClick={() => setStep(2)} className="text-[10px] text-accent font-bold uppercase tracking-widest hover:underline">Change</button>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 block">Payment mode</label>
                <div className="flex gap-2">
                  {["Cash", "UPI", "Card", "Other"].map(mode => {
                    const isSelected = paymentMethod.toLowerCase() === mode.toLowerCase();
                    return (
                      <button key={mode} type="button" onClick={() => setPaymentMethod(mode.toLowerCase())} className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all border ${isSelected ? "bg-accent text-white border-accent" : "bg-white text-text-muted border-border hover:bg-hover"}`}>
                        {mode}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Amount Card */}
              <div className="bg-white border border-border rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Plan fee</span>
                  <span className="text-base font-mono font-bold text-text-primary">{formatINR(totalFee)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Full payment</span>
                  <button type="button" onClick={() => setIsFullPayment(!isFullPayment)} className={`w-11 h-6 rounded-full transition-colors relative ${isFullPayment ? "bg-accent" : "bg-border"}`}>
                    <span className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-transform ${isFullPayment ? "left-6" : "left-1"}`} />
                  </button>
                </div>

                {!isFullPayment && (
                  <div className="pt-2 animate-fade-in">
                    <input type="number" placeholder={String(totalFee)} value={customAmount} onChange={e => setCustomAmount(e.target.value)} className="w-full h-12 bg-page border border-border rounded-xl px-4 text-sm text-text-primary font-bold font-mono focus:border-accent outline-none" />
                    <p className="text-[10px] font-bold text-status-danger-text mt-2 uppercase tracking-widest">
                      Remaining Due: <span className="font-mono">₹{Math.max(0, totalFee - (Number(customAmount) || 0))}</span>
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-border flex justify-between items-end">
                  <span className="text-xs text-text-muted uppercase tracking-widest font-bold">Total Collection</span>
                  <span className="text-2xl font-mono font-bold text-accent">{formatINR(amountPaid)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && successData && (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-up">
              <div className="w-20 h-20 bg-status-success-bg rounded-full flex items-center justify-center mb-6 border border-status-success-border shadow-md">
                <CheckCircle2 className="w-10 h-10 text-status-success-text" />
              </div>
              <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] mb-2">Member Onboarded</h2>
              <p className="text-2xl font-bold text-text-primary mb-1">{successData.name}</p>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-8">{successData.planName} • Exp {successData.expiry}</p>

              <div className="w-full max-w-xs space-y-3">
                <a 
                  href={`https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${successData.name.split(' ')[0]}, welcome to the gym! Your ${successData.planName} membership is active until ${successData.expiry}. See you at the gym! 💪`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center w-full h-12 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-bold transition-all gap-2 shadow-lg shadow-[#25D366]/20 uppercase text-xs tracking-widest"
                >
                  <MessageCircle size={18} />
                  Share Receipt
                </a>
                <button type="button" onClick={() => {
                  setStep(1); setFullName(""); setPhone(""); setPhotoUrl(""); setDeviceId(""); setCustomAmount(""); setIsFullPayment(true);
                }} className="flex items-center justify-center w-full h-12 bg-white border border-border text-text-primary hover:bg-hover rounded-xl font-bold transition-all uppercase text-xs tracking-widest">
                  Next Member
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {step < 4 && (
          <div className="p-6 border-t border-border bg-white">
            {step === 1 && (
              <button type="button" onClick={handleNextToPlan} className="w-full h-12 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-lg shadow-accent/20">
                Continue to Plans <ChevronRight size={16} />
              </button>
            )}
            {step === 2 && (
              <button type="button" onClick={handleNextToPayment} className="w-full h-12 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-lg shadow-accent/20">
                Continue to Payment <ChevronRight size={16} />
              </button>
            )}
            {step === 3 && (
              <button type="submit" disabled={isPending} className="w-full h-12 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs shadow-lg shadow-accent/20">
                {isPending ? "Creating Account..." : "Confirm & Enroll Member"}
              </button>
            )}
          </div>
        )}
      </form>
    </BottomSheet>
  );
}
