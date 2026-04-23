"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Info, Check, Smartphone, Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { updateReminderModeAction, updateWhatsappConfigAction } from "@/app/actions/whatsapp";
import { toast } from "sonner";

interface Props {
  gym: any;
}

export default function WhatsappSettingsClient({ gym }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showApiKey, setShowApiKey] = useState(false);

  const [mode, setMode] = useState<'manual' | 'auto'>(gym.whatsapp_reminder_mode || 'manual');
  const [phone, setPhone] = useState(gym.whatsapp_phone_number || "");
  const [apiKey, setApiKey] = useState(""); // We don't show the encrypted key back

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
              <span className="bg-[#10B981]/10 text-[#10B981] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">Self-managed API</span>
            </div>
            {mode === 'auto' && <Check size={16} className="absolute right-4 bottom-4 text-[#10B981]" />}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-4">
          <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
          <div className="space-y-2">
            <p className="text-xs text-blue-100/70 leading-relaxed">
              Auto-reminders require a WhatsApp Business API account (AiSensy, Gupshup, etc.). 
              RepCore connects to your API to send messages automatically. You manage your wallet and template approvals directly on your API provider's dashboard.
            </p>
          </div>
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
      </div>
    </div>
  );
}
