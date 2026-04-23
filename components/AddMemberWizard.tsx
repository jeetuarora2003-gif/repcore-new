"use client";

import { useState, useTransition, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Check, Camera, Search, User, CreditCard, ChevronRight, CheckCircle2 } from "lucide-react";
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
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
      {[
        { num: 1, label: "Profile" },
        { num: 2, label: "Plan" },
        { num: 3, label: "Payment" },
      ].map((s, i) => {
        const isActive = step === s.num;
        const isPast = step > s.num;
        return (
          <div key={s.num} className="flex flex-col items-center flex-1 relative z-10">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              isPast ? "bg-[#10B981] text-white" : 
              isActive ? "bg-[#10B981] text-white ring-4 ring-[#10B981]/20" : 
              "bg-[#27272A] text-[#71717A]"
            }`}>
              {isPast ? <Check size={16} strokeWidth={3} /> : s.num}
            </div>
            <span className={`mt-2 text-[11px] font-medium ${isActive ? "text-[#10B981]" : "text-[#71717A]"}`}>
              {s.label}
            </span>
            {/* Connecting lines */}
            {i < 2 && (
              <div className={`absolute top-4 left-[60%] w-[80%] h-[2px] -z-10 ${isPast ? "bg-[#10B981]" : "bg-[#27272A]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <BottomSheet open={isOpen} onClose={onClose} title={step === 4 ? "" : "New Member"}>
      {step < 4 && <StepIndicator />}

      <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
        {/* Hidden inputs to guarantee they are never empty during submit */}
        <input type="hidden" name="startDate" value={startDate || defaultDate} />
        <input type="hidden" name="planId" value={selectedPlanId} />
        <input type="hidden" name="paymentMethod" value={paymentMethod || "cash"} />
        <input type="hidden" name="amountPaid" value={amountPaid ?? totalFee} />
        <input type="hidden" name="photoUrl" value={photoUrl || ""} />
        <input type="hidden" name="deviceEnrollmentId" value={deviceId || ""} />

        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {/* STEP 1: PROFILE */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4">
                <button type="button" className="h-16 w-16 rounded-full border-2 border-dashed border-white/20 flex flex-col items-center justify-center bg-[#18181B] hover:bg-[#27272A] transition-colors">
                  <Camera size={20} className="text-[#A1A1AA]" />
                  <span className="text-[9px] text-[#A1A1AA] mt-1">Add photo</span>
                </button>
                <p className="text-xs text-[#71717A]">Tap to take a photo or upload from gallery</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#A1A1AA] mb-1.5 block">Full name *</label>
                  <input required placeholder="e.g. Rahul Sharma" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full h-12 bg-[#18181B] border border-white/[0.05] rounded-xl px-4 text-sm text-[#E4E4E7] focus:border-[#10B981]/50 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-[#A1A1AA] mb-1.5 block">Phone number *</label>
                  <input required type="tel" maxLength={10} placeholder="10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} className="w-full h-12 bg-[#18181B] border border-white/[0.05] rounded-xl px-4 text-sm text-[#E4E4E7] font-mono focus:border-[#10B981]/50 focus:outline-none transition-colors" />
                  {phone.length > 0 && phone.length < 10 && <p className="text-[#EF4444] text-[10px] mt-1">Must be exactly 10 digits</p>}
                </div>
                <div>
                  <label className="text-xs text-[#A1A1AA] mb-1.5 block">Device Enrollment ID</label>
                  <input placeholder="e.g. 007" value={deviceId} onChange={e => setDeviceId(e.target.value)} className="w-full h-12 bg-[#18181B] border border-white/[0.05] rounded-xl px-4 text-sm text-[#E4E4E7] font-mono focus:border-[#10B981]/50 focus:outline-none transition-colors" />
                  <p className="text-[10px] text-[#71717A] mt-1">Only needed if you use a fingerprint device</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PLAN SELECTION */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A1A1AA] font-semibold mb-3 block">Select plan</label>
                <div className="space-y-3">
                  {plans.map(p => {
                    const isSelected = selectedPlanId === p.id;
                    const isPopular = p.id === popularPlanId;
                    return (
                      <button key={p.id} type="button" onClick={() => setSelectedPlanId(p.id)} className={`w-full min-h-[64px] text-left rounded-xl p-4 flex items-center justify-between border transition-all ${isSelected ? "bg-[#10B981]/10 border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "bg-[#18181B] border-white/[0.05] hover:bg-[#27272A]"}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-medium ${isSelected ? "text-[#10B981]" : "text-[#E4E4E7]"}`}>{p.name}</h4>
                            {isPopular && <span className="bg-[#10B981]/20 text-[#10B981] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Popular</span>}
                          </div>
                          <p className="text-xs text-[#71717A] mt-0.5">{p.duration_days} days</p>
                        </div>
                        <span className={`text-base font-mono font-medium ${isSelected ? "text-[#10B981]" : "text-[#E4E4E7]"}`}>{formatINR(p.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#A1A1AA] mb-1.5 block">Start date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full h-12 bg-[#18181B] border border-white/[0.05] rounded-xl px-4 text-sm text-[#E4E4E7] focus:border-[#10B981]/50 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-[#A1A1AA] mb-1.5 block">Expires on</label>
                  <input disabled value={expiresOn} className="w-full h-12 bg-[#18181B]/50 border border-white/[0.02] rounded-xl px-4 text-sm text-[#71717A] cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Plan Summary Strip */}
              <div className="bg-[#18181B] border border-white/[0.05] rounded-lg p-3 flex justify-between items-center">
                <p className="text-xs text-[#E4E4E7] font-medium">
                  {selectedPlan?.name} <span className="text-[#71717A] px-1">·</span> {selectedPlan?.duration_days} days <span className="text-[#71717A] px-1">·</span> <span className="text-[#A1A1AA]">Expires {expiresOn}</span>
                </p>
                <button type="button" onClick={() => setStep(2)} className="text-[11px] text-[#10B981] font-medium hover:underline">Change</button>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="text-xs text-[#A1A1AA] mb-2 block">Payment mode</label>
                <div className="flex gap-2">
                  {["Cash", "UPI", "Card", "Other"].map(mode => {
                    const isSelected = paymentMethod.toLowerCase() === mode.toLowerCase();
                    return (
                      <button key={mode} type="button" onClick={() => setPaymentMethod(mode.toLowerCase())} className={`flex-1 h-10 rounded-lg text-xs font-medium transition-all border ${isSelected ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]" : "bg-[#18181B] text-[#A1A1AA] border-white/[0.05] hover:bg-[#27272A]"}`}>
                        {mode}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Amount Card */}
              <div className="bg-[#18181B] border border-white/[0.05] rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#E4E4E7]">Plan fee</span>
                  <span className="text-sm font-mono text-[#E4E4E7]">{formatINR(totalFee)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-[#A1A1AA]">Full payment today</span>
                  <button type="button" onClick={() => setIsFullPayment(!isFullPayment)} className={`w-11 h-6 rounded-full transition-colors relative ${isFullPayment ? "bg-[#10B981]" : "bg-[#3F3F46]"}`}>
                    <span className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-transform ${isFullPayment ? "left-6" : "left-1"}`} />
                  </button>
                </div>

                {!isFullPayment && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <input type="number" placeholder={String(totalFee)} value={customAmount} onChange={e => setCustomAmount(e.target.value)} className="w-full h-12 bg-[#27272A] border border-white/[0.05] rounded-xl px-4 text-sm text-[#E4E4E7] font-mono focus:border-[#10B981]/50 focus:outline-none" />
                    <p className="text-[10px] text-[#A1A1AA] mt-2">
                      Remaining <span className="font-mono text-[#E4E4E7]">₹{Math.max(0, totalFee - (Number(customAmount) || 0))}</span> will be recorded as due
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-white/[0.05] flex justify-between items-end">
                  <span className="text-xs text-[#A1A1AA] uppercase tracking-wider font-semibold">Collecting today</span>
                  <span className="text-[18px] font-mono font-medium text-[#10B981]">{formatINR(amountPaid)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && successData && (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-[#10B981]/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-[#10B981]/10">
                <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
              </div>
              <h2 className="text-[20px] font-medium text-[#E4E4E7] mb-2">Member Added!</h2>
              <p className="text-2xl font-semibold text-white mb-1">{successData.name}</p>
              <p className="text-sm text-[#71717A] mb-8">{successData.planName} · Expires {successData.expiry}</p>

              <div className="w-full space-y-3">
                <a 
                  href={`https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${successData.name.split(' ')[0]}, welcome to the gym! Your ${successData.planName} membership is active until ${successData.expiry}. See you at the gym! 💪`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center w-full h-12 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-medium transition-colors gap-2"
                >
                  Share Receipt on WhatsApp
                </a>
                <button type="button" onClick={() => {
                  // Reset form for next member
                  setStep(1); setFullName(""); setPhone(""); setPhotoUrl(""); setDeviceId(""); setCustomAmount(""); setIsFullPayment(true);
                }} className="flex items-center justify-center w-full h-12 bg-[#18181B] hover:bg-[#27272A] border border-white/[0.05] text-[#E4E4E7] rounded-xl font-medium transition-colors">
                  Add Another Member
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {step < 4 && (
          <div className="p-4 border-t border-white/[0.05] bg-[#09090B]">
            {step === 1 && (
              <button type="button" onClick={handleNextToPlan} className="w-full h-12 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                Next: Choose Plan <ChevronRight size={16} />
              </button>
            )}
            {step === 2 && (
              <button type="button" onClick={handleNextToPayment} className="w-full h-12 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                Next: Payment <ChevronRight size={16} />
              </button>
            )}
            {step === 3 && (
              <button type="submit" disabled={isPending} className="w-full h-12 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isPending ? "Processing..." : "Finish & Add Member →"}
              </button>
            )}
          </div>
        )}
      </form>
    </BottomSheet>
  );
}
