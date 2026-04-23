"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Info, Check, Smartphone, Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { updateReminderModeAction, updateWhatsappConfigAction } from "@/app/actions/whatsapp";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="animate-fade-up max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <Link href="/settings" className="inline-flex items-center text-[10px] font-bold text-text-muted hover:text-accent uppercase tracking-widest transition-colors mb-2 gap-1">
          <ChevronLeft size={14} strokeWidth={3} />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">WhatsApp Reminders</h1>
        <p className="text-sm text-text-secondary">Automate member renewals or send manual pre-written messages</p>
      </div>

      {/* Mode Selector */}
      <div className="grid gap-4">
        <button 
          onClick={() => handleModeChange('manual')}
          className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${mode === 'manual' ? "bg-accent-light border-accent shadow-sm" : "bg-white border-border hover:border-border-strong"}`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1 pr-8">
              <h3 className={`text-sm font-bold uppercase tracking-wide ${mode === 'manual' ? "text-accent-text" : "text-text-primary"}`}>Manual reminders</h3>
              <p className="text-xs text-text-secondary font-medium leading-relaxed max-w-[400px]">
                One-tap sending. RepCore opens WhatsApp with a personalized message — you just hit send. Ideal for relationship building.
              </p>
            </div>
            <span className="bg-accent text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">Free</span>
          </div>
          {mode === 'manual' && <div className="absolute right-4 bottom-4 h-6 w-6 bg-accent rounded-full flex items-center justify-center text-white"><Check size={14} strokeWidth={3} /></div>}
        </button>

        <button 
          onClick={() => handleModeChange('auto')}
          className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${mode === 'auto' ? "bg-accent-light border-accent shadow-sm" : "bg-white border-border hover:border-border-strong"}`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1 pr-8">
              <h3 className={`text-sm font-bold uppercase tracking-wide ${mode === 'auto' ? "text-accent-text" : "text-text-primary"}`}>Auto reminders</h3>
              <p className="text-xs text-text-secondary font-medium leading-relaxed max-w-[400px]">
                Fully automated messaging. RepCore sends renewal alerts on day 5, 3, and 1 via your own API provider.
              </p>
            </div>
            <span className="bg-accent text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">API Required</span>
          </div>
          {mode === 'auto' && <div className="absolute right-4 bottom-4 h-6 w-6 bg-accent rounded-full flex items-center justify-center text-white"><Check size={14} strokeWidth={3} /></div>}
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-status-info-bg border border-status-info-border rounded-2xl p-5 flex gap-4 animate-fade-in">
        <Info className="text-status-info-text shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-status-info-text uppercase tracking-widest">Bring Your Own API</p>
          <p className="text-xs text-status-info-text leading-relaxed font-medium">
            Connect to any WhatsApp Business API (like AiSensy or Gupshup). 
            You maintain full control of your messaging wallet and template approvals on your provider's dashboard.
          </p>
        </div>
      </div>

      {/* Auto Setup Section */}
      {mode === 'auto' && (
        <div className="bg-white border border-border rounded-2xl p-8 space-y-6 animate-fade-in shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="h-8 w-8 rounded-lg bg-accent-light flex items-center justify-center text-accent-text border border-accent-border">
              <Smartphone size={16} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">API Configuration</h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">WhatsApp Business Number</label>
              <Input 
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="h-12 font-bold font-mono"
              />
              <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Must be your registered API number</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">API Key</label>
              <div className="relative">
                <Input 
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Paste key from provider dashboard"
                  className="h-12 font-mono pr-12"
                />
                <button 
                  type="button" 
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                Encryption key will be stored securely. <a href="https://aisensy.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Get an API key</a>
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full h-12 uppercase tracking-[0.2em] text-xs"
            >
              {isPending ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              Save & Activate Automation
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
