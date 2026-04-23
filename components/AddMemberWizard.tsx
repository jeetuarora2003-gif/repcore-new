"use client";

import { useState, useTransition, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Check, Camera, Search, User, CreditCard, ChevronRight, CheckCircle2, MessageCircle, Sparkles, Smartphone, ShieldCheck, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
        
        // Auto close after 8s
        setTimeout(() => {
          if (isOpen && step === 4) {
            onClose();
          }
        }, 8000);
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[2px] bg-hover z-0" />
      {[
        { num: 1, label: "Profile", icon: User },
        { num: 2, label: "Tier", icon: Sparkles },
        { num: 3, label: "Billing", icon: CreditCard },
      ].map((s, i) => {
        const isActive = step === s.num;
        const isPast = step > s.num;
        const Icon = s.icon;
        return (
          <div key={s.num} className="flex flex-col items-center flex-1 relative z-10">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-500 shadow-sm ${
              isPast ? "bg-accent text-white" : 
              isActive ? "bg-accent text-white ring-4 ring-accent/10" : 
              "bg-white text-text-muted border-2 border-border"
            }`}>
              {isPast ? <Check size={14} strokeWidth={3} /> : <Icon size={14} strokeWidth={2.5} />}
            </div>
            <span className={`mt-2 text-[8px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${isActive ? "text-accent" : "text-text-muted"}`}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[500px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl bg-white animate-fade-up">
        <DialogHeader className="hidden">
          <DialogTitle>Membership Orchestration</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col bg-white overflow-hidden">
          {step < 4 && <StepIndicator />}

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-page max-h-[70vh]">
            <div className="p-6 md:p-8 space-y-6">
              {/* STEP 1: PROFILE */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-up">
                  <div className="bg-white p-5 rounded-[1.5rem] border-2 border-border shadow-sm flex items-center gap-5">
                    <div className="relative group">
                      <div className="h-20 w-20 rounded-full border-4 border-dashed border-border flex flex-col items-center justify-center bg-page group-hover:border-accent group-hover:bg-accent-light transition-all cursor-pointer overflow-hidden">
                        {photoUrl ? (
                          <img src={photoUrl} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <>
                            <Camera size={24} className="text-text-muted group-hover:text-accent transition-colors" />
                            <span className="text-[8px] font-bold text-text-muted uppercase mt-1">Photo</span>
                          </>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-accent rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg">
                        <Plus size={12} strokeWidth={3} />
                      </div>
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
                        onChange={e => setFullName(e.target.value)} 
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
                          onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
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
                        onChange={e => setDeviceId(e.target.value)} 
                        className="w-full h-12 bg-white border-2 border-border rounded-xl px-5 text-sm text-text-primary font-bold font-mono placeholder:text-text-muted/50 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PLAN SELECTION */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-up">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">Select Subscription</h3>
                    <span className="text-[8px] font-bold bg-accent-light text-accent-text px-2 py-0.5 rounded-full border border-accent-border uppercase tracking-widest">{plans.length} Tiers</span>
                  </div>
                  
                  <div className="grid gap-3">
                    {plans.map(p => {
                      const isSelected = selectedPlanId === p.id;
                      const isPopular = p.id === popularPlanId;
                      return (
                        <button 
                          key={p.id} 
                          type="button" 
                          onClick={() => setSelectedPlanId(p.id)} 
                          className={`group w-full rounded-xl p-4 flex items-center justify-between border-2 transition-all relative overflow-hidden ${
                            isSelected 
                              ? "bg-white border-accent shadow-lg ring-4 ring-accent/5" 
                              : "bg-white/60 border-border hover:border-border-strong hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3 relative z-10">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? "bg-accent text-white" : "bg-page text-text-muted border border-border"}`}>
                              <Sparkles size={16} />
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-xs font-bold uppercase tracking-wide ${isSelected ? "text-accent-text" : "text-text-primary"}`}>{p.name}</h4>
                                {isPopular && <span className="bg-accent text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest">Best</span>}
                              </div>
                              <p className="text-[9px] font-bold text-text-muted mt-0.5 uppercase tracking-widest">{p.duration_days} Days</p>
                            </div>
                          </div>
                          <div className="text-right relative z-10">
                            <span className={`text-lg font-mono font-bold tracking-tighter ${isSelected ? "text-accent-text" : "text-text-primary"}`}>{formatINR(p.price)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-white p-5 rounded-[1.5rem] border-2 border-border shadow-sm">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">Onboarding Date</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full h-11 bg-page border-2 border-border rounded-xl px-4 text-[11px] text-text-primary font-bold focus:border-accent outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">Expiry Forecast</label>
                      <div className="w-full h-11 bg-hover border-2 border-border rounded-xl px-4 text-[11px] text-text-secondary font-bold flex items-center">{expiresOn}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-up">
                  <div className="bg-white border-2 border-border rounded-[1.5rem] overflow-hidden shadow-sm">
                    <div className="bg-accent-light p-5 border-b-2 border-accent-border flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-bold text-accent-text uppercase tracking-[0.2em] mb-0.5">Active Selection</p>
                        <p className="text-xs font-bold text-accent-text">{selectedPlan?.name}</p>
                      </div>
                      <button type="button" onClick={() => setStep(2)} className="h-7 w-7 bg-white rounded-lg flex items-center justify-center text-accent shadow-sm border border-accent-border hover:bg-accent hover:text-white transition-all">
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
                        <button type="button" onClick={() => setIsFullPayment(!isFullPayment)} className={`w-10 h-5 rounded-full transition-all relative ${isFullPayment ? "bg-accent shadow-lg shadow-accent/20" : "bg-border"}`}>
                          <div className={`absolute top-0.5 bottom-0.5 w-3.5 bg-white rounded-full transition-all shadow-sm ${isFullPayment ? "left-6" : "left-0.5"}`} />
                        </button>
                      </div>

                      {!isFullPayment && (
                        <div className="space-y-3 animate-fade-in">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">Collected Amount</label>
                            <input type="number" placeholder="Enter custom amount" value={customAmount} onChange={e => setCustomAmount(e.target.value)} className="w-full h-12 bg-white border-2 border-border rounded-xl px-5 text-sm text-text-primary font-bold font-mono focus:border-accent outline-none shadow-inner" />
                          </div>
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-bold text-status-danger-text uppercase tracking-widest">Balance Due</span>
                            <span className="text-[11px] font-mono font-bold text-status-danger-text">₹{Math.max(0, totalFee - (Number(customAmount) || 0))}</span>
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
                      {["Cash", "UPI", "Card", "Other"].map(mode => {
                        const isSelected = paymentMethod.toLowerCase() === mode.toLowerCase();
                        return (
                          <button key={mode} type="button" onClick={() => setPaymentMethod(mode.toLowerCase())} className={`h-9 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border-2 ${isSelected ? "bg-accent text-white border-accent shadow-md scale-105" : "bg-white text-text-muted border-border hover:border-border-strong"}`}>
                            {mode}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SUCCESS */}
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
                    <a 
                      href={`https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${successData.name.split(' ')[0]}, welcome to the gym! Your ${successData.planName} membership is active until ${successData.expiry}. See you at the gym! 💪`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center w-full h-12 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-bold transition-all gap-2 shadow-lg shadow-[#25D366]/20 uppercase text-[10px] tracking-[0.1em]"
                    >
                      <MessageCircle size={18} />
                      Send Receipt
                    </a>
                    <button type="button" onClick={() => {
                      setStep(1); setFullName(""); setPhone(""); setPhotoUrl(""); setDeviceId(""); setCustomAmount(""); setIsFullPayment(true);
                    }} className="flex items-center justify-center w-full h-12 bg-white border-2 border-border text-text-primary hover:bg-hover rounded-xl font-bold transition-all uppercase text-[10px] tracking-[0.1em]">
                      Next Member
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Action Buttons */}
          {step < 4 && (
            <div className="p-6 border-t border-border bg-white flex gap-3">
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={() => setStep(step - 1)} 
                  className="h-12 px-4 bg-white border-2 border-border text-text-muted rounded-xl font-bold hover:bg-hover transition-all"
                >
                  <ChevronRight size={18} className="rotate-180" />
                </button>
              )}
              <button 
                type="button" 
                onClick={step === 3 ? undefined : (step === 2 ? handleNextToPayment : handleNextToPlan)} 
                onClickCapture={step === 3 ? (e) => handleSubmit(e as any) : undefined}
                disabled={isPending} 
                className="flex-1 h-12 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-[0.1em] text-[11px] shadow-lg shadow-accent/20 disabled:opacity-50"
              >
                {isPending ? "Processing..." : (
                  <>
                    {step === 1 && "Next: Select Tier"}
                    {step === 2 && "Next: Billing"}
                    {step === 3 && "Finish Enrollment"}
                    <ChevronRight size={16} strokeWidth={3} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
