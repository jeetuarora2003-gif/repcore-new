"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Info, Check, Smartphone, Zap, Eye, EyeOff, Loader2, CreditCard, History, AlertCircle } from "lucide-react";
import { formatINR } from "@/lib/helpers";
import { updateReminderModeAction, updateWhatsappConfigAction, createRazorpayOrder, addCreditsAction } from "@/app/actions/whatsapp";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props {
  gym: any;
  balancePaise: number;
  transactions: any[];
}

export default function WhatsappSettingsClient({ gym, balancePaise, transactions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showApiKey, setShowApiKey] = useState(false);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);

  const [mode, setMode] = useState<'manual' | 'auto'>(gym.whatsapp_reminder_mode || 'manual');
  const [phone, setPhone] = useState(gym.whatsapp_phone_number || "");
  const [apiKey, setApiKey] = useState(""); // We don't show the encrypted key back
  const [topupAmount, setTopupAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");

  const balanceINR = balancePaise / 100;
  const messagesRemaining = Math.floor(balancePaise / 15);
  const isLowBalance = balancePaise < 2000; // Low if < ₹20

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  function handleModeChange(newMode: 'manual' | 'auto') {
    setMode(newMode);
    startTransition(async () => {
      try {
        await updateReminderModeAction(gym.id, newMode);
        toast.success(`Mode changed to ${newMode}`);
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || !apiKey) {
      toast.error("Please fill in both phone and API key");
      return;
    }
    startTransition(async () => {
      try {
        await updateWhatsappConfigAction(gym.id, { phone, apiKey, mode: 'auto' });
        toast.success("WhatsApp configuration saved and auto-reminders active");
        setApiKey(""); // Clear local state after save
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  async function handleTopup() {
    const amount = customAmount ? parseInt(customAmount) : topupAmount;
    if (isNaN(amount) || amount < 50) {
      toast.error("Minimum top-up is ₹50");
      return;
    }

    setLoadingRazorpay(true);
    const orderRes = await createRazorpayOrder(amount * 100);
    setLoadingRazorpay(false);

    if (!orderRes.success) {
      toast.error("Could not create payment order: " + orderRes.error);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderRes.order.amount,
      currency: "INR",
      name: "RepCore WhatsApp Credits",
      description: `Top-up for ${gym.name}`,
      order_id: orderRes.order.id,
      handler: async (response: any) => {
        try {
          await addCreditsAction(gym.id, orderRes.order.amount, response);
          toast.success("Credits added successfully!");
          setCustomAmount("");
          router.refresh();
        } catch (err) {
          toast.error("Payment verification failed: " + (err as Error).message);
        }
      },
      prefill: {
        name: gym.name,
        contact: gym.phone,
      },
      theme: { color: "#10B981" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <div className="pb-24 min-h-screen bg-[#09090B]">
      <div className="px-4 py-8 md:px-8 max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <Link href="/settings" className="inline-flex items-center text-xs text-[#71717A] hover:text-[#E4E4E7] transition-colors mb-2">
            <ChevronLeft size={14} />
            Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-[#E4E4E7]">WhatsApp Reminders</h1>
          <p className="text-sm text-[#71717A]">Choose how you want to send member reminders</p>
        </div>

        {/* Mode Selector */}
        <div className="grid gap-4">
          <button 
            onClick={() => handleModeChange('manual')}
            className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${mode === 'manual' ? "bg-[#10B981]/10 border-[#10B981] ring-1 ring-[#10B981]" : "bg-surface border-white/5 hover:border-white/10"}`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1 pr-8">
                <h3 className={`text-sm font-semibold ${mode === 'manual' ? "text-[#10B981]" : "text-[#E4E4E7]"}`}>Manual reminders</h3>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  You tap Send for each member. RepCore opens WhatsApp with the message pre-written — you just hit send.
                </p>
              </div>
              <span className="bg-[#10B981]/10 text-[#10B981] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Free forever</span>
            </div>
            {mode === 'manual' && <Check size={16} className="absolute right-4 bottom-4 text-[#10B981]" />}
          </button>

          <button 
            onClick={() => handleModeChange('auto')}
            className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${mode === 'auto' ? "bg-[#10B981]/10 border-[#10B981] ring-1 ring-[#10B981]" : "bg-surface border-white/5 hover:border-white/10"}`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1 pr-8">
                <h3 className={`text-sm font-semibold ${mode === 'auto' ? "text-[#10B981]" : "text-[#E4E4E7]"}`}>Auto reminders</h3>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  RepCore sends messages automatically on day 5, 3, and 1 before expiry — even when you're not online.
                </p>
              </div>
              <span className="bg-[#F59E0B]/10 text-[#F59E0B] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">Uses message credits</span>
            </div>
            {mode === 'auto' && <Check size={16} className="absolute right-4 bottom-4 text-[#10B981]" />}
          </button>
        </div>

        {/* Auto Setup Section */}
        {mode === 'auto' && (
          <div className="card p-6 space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <div className="h-7 w-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981] border border-[#10B981]/20">
                <Smartphone size={14} />
              </div>
              <h3 className="text-sm font-semibold text-[#E4E4E7]">WhatsApp Business Setup</h3>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A1A1AA]">WhatsApp Business number</label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-10 rounded-xl bg-[#09090B] border border-white/8 px-4 text-sm text-[#E4E4E7] placeholder-[#71717A] focus:outline-none focus:border-[#10B981]/40 transition-all"
                />
                <p className="text-[10px] text-[#71717A]">This number must be registered on WhatsApp Business API</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A1A1AA]">API key (from AiSensy or Gupshup)</label>
                <div className="relative">
                  <input 
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Paste your API key here"
                    className="w-full h-10 rounded-xl bg-[#09090B] border border-white/8 px-4 pr-12 text-sm text-[#E4E4E7] font-mono placeholder-[#71717A] focus:outline-none focus:border-[#10B981]/40 transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#E4E4E7] transition-colors"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-[#71717A]">
                  Don't have one? <a href="https://aisensy.com" target="_blank" rel="noopener noreferrer" className="text-[#10B981] hover:underline">Get it from AiSensy.com</a>
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full h-11 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                Save & Activate Auto Reminders
              </button>
            </form>
          </div>
        )}

        {/* Message Credits Section */}
        <div className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-4">
            <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-blue-100/70 leading-relaxed">
              RepCore charges you nothing extra. WhatsApp (Meta) charges ₹0.15 per automated message. We pass this cost at exact rate — zero markup. Credits are only used when Auto mode is on.
            </p>
          </div>

          <div className="card p-6 space-y-8 relative overflow-hidden">
            {isLowBalance && (
              <div className="absolute top-4 right-4 bg-[#EF4444]/10 text-[#EF4444] text-[10px] font-bold px-2 py-0.5 rounded border border-[#EF4444]/20 animate-pulse">
                Low balance
              </div>
            )}

            <div className="space-y-1">
              <span className="text-xs font-medium text-[#A1A1AA]">Message credits</span>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold font-mono text-[#E4E4E7]">{formatINR(balanceINR)}</h2>
                <span className="text-xs text-[#71717A]">~{messagesRemaining} messages remaining</span>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-4 gap-3">
                {[50, 100, 200, 500].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => { setTopupAmount(amt); setCustomAmount(""); }}
                    className={`h-10 rounded-xl text-xs font-bold font-mono border transition-all ${topupAmount === amt && !customAmount ? "bg-[#10B981]/10 border-[#10B981] text-[#10B981]" : "bg-surface-2 border-white/5 text-[#A1A1AA] hover:border-white/10"}`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-[#71717A] font-bold ml-1">Or enter custom amount (min ₹50)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] font-mono">₹</span>
                  <input 
                    type="number"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full h-12 bg-surface-2 border border-white/5 rounded-xl pl-8 pr-4 text-sm text-[#E4E4E7] font-mono focus:outline-none focus:border-[#10B981]/40 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleTopup}
                disabled={loadingRazorpay}
                className="w-full h-14 bg-gradient-to-br from-[#10B981] to-[#059669] text-white rounded-2xl font-bold text-sm shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loadingRazorpay ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
                Add credits via UPI →
              </button>

              <p className="text-[11px] text-[#71717A] text-center italic">
                For a 200-member gym, auto reminders cost roughly ₹20–80 per month
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <History size={14} className="text-[#A1A1AA]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#71717A]">Recent credit activity</h3>
          </div>

          <div className="card divide-y divide-white/5">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#71717A]">No activity yet</div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="p-4 flex items-center justify-between group">
                  <div className="space-y-0.5">
                    <p className="text-sm text-[#E4E4E7]">{tx.description}</p>
                    <p className="text-[11px] text-[#71717A] font-mono uppercase">
                      {new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`text-sm font-bold font-mono tabular-nums ${tx.type === 'topup' ? "text-[#10B981]" : "text-[#71717A]"}`}>
                    {tx.type === 'topup' ? "+" : "−"}₹{(tx.amount_paise / 100).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
