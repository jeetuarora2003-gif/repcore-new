"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Save, Eye, EyeOff, Building2, MessageCircle, FileText, Download, ShieldCheck, Zap } from "lucide-react";
import { memberInitials, cleanPhone } from "@/lib/helpers";
import type { Gym } from "@/lib/supabase/types";
import { updateGymSettings } from "@/app/actions/gym";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Props {
  gym: Gym;
}

export default function SettingsClient({ gym }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showApiKey, setShowApiKey] = useState(false);

  const [form, setForm] = useState({
    name: gym.name,
    address: gym.address,
    phone: gym.phone,
    receipt_prefix: gym.receipt_prefix,
    invoice_prefix: gym.invoice_prefix,
    whatsapp_api_key: gym.whatsapp_api_key,
  });

  function handleChange(field: string, value: string) {
    if (field === "phone") {
      setForm(p => ({ ...p, [field]: cleanPhone(value) }));
      return;
    }
    setForm(p => ({ ...p, [field]: value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateGymSettings(gym.id, form);
        toast.success("Settings updated successfully");
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="pb-24 min-h-screen bg-[#080810] animate-fade-up">
      <form onSubmit={handleSave} className="px-4 py-8 md:px-8 max-w-2xl space-y-8 mx-auto">
        {/* Gym Profile */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] border border-[#6366F1]/20">
                <Building2 size={14} />
              </div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Business Profile</h3>
            </div>
            <div className="h-8 w-8 rounded-lg bg-surface-3 flex items-center justify-center text-[#6366F1] text-[10px] font-bold border border-white/5">
              {memberInitials(form.name || "G")}
            </div>
          </div>

          <div className="grid gap-5">
            {[
              { field: "name", label: "Gym Name", placeholder: "Your gym name", type: "text" },
              { field: "address", label: "Business Address", placeholder: "Street, City, State", type: "text" },
              { field: "phone", label: "Official Contact Number", placeholder: "98765 43210", type: "tel" },
            ].map(({ field, label, placeholder, type }) => (
              <div key={field} className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8]">{label}</label>
                <input
                  type={type}
                  value={form[field as keyof typeof form]}
                  onChange={e => handleChange(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full h-10 rounded-xl bg-[#080810] border border-white/8 px-4 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1]/40 focus:ring-4 focus:ring-[#6366F1]/5 transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* System Config */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="h-7 w-7 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] border border-[#F59E0B]/20">
              <FileText size={14} />
            </div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">System Configuration</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { field: "receipt_prefix", label: "Receipt Series Prefix" },
              { field: "invoice_prefix", label: "Invoice Series Prefix" },
            ].map(({ field, label }) => (
              <div key={field} className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8]">{label}</label>
                <input
                  type="text"
                  value={form[field as keyof typeof form]}
                  onChange={e => handleChange(field, e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#080810] border border-white/8 px-4 text-sm text-[#F8FAFC] font-mono focus:outline-none focus:border-[#6366F1]/40 transition-all uppercase"
                />
                <p className="text-[10px] text-[#475569] font-mono tracking-wider pl-1">
                  PREVIEW: {form[field as keyof typeof form] || "REP"}-{new Date().getFullYear()}-0001
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Integration */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="h-7 w-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981] border border-[#10B981]/20">
              <Zap size={14} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">WhatsApp Integration</h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#94A3B8]">WhatsApp API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={form.whatsapp_api_key}
                  onChange={e => handleChange("whatsapp_api_key", e.target.value)}
                  placeholder="sk-..."
                  className="w-full h-10 rounded-xl bg-[#080810] border border-white/8 px-4 pr-12 text-sm text-[#F8FAFC] font-mono placeholder-[#475569] focus:outline-none focus:border-[#6366F1]/40 focus:ring-4 focus:ring-[#6366F1]/5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#F8FAFC] transition-colors"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="bg-surface-2 rounded-xl p-4 flex justify-between items-center border border-white/5 group hover:border-[#10B981]/20 transition-all">
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-[#10B981]" />
                <span className="text-xs font-medium text-[#94A3B8]">Messaging Balance</span>
              </div>
              <span className="text-sm font-bold font-mono text-[#F8FAFC] tabular-nums">{gym.whatsapp_credits} units</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="space-y-4 pt-6">
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 rounded-xl bg-[#6366F1] text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-[#6366F1]/20 disabled:opacity-50"
          >
            <Save size={16} />
            {isPending ? "Saving changes..." : "Save Settings"}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled
              className="h-10 rounded-xl bg-surface border border-white/6 text-[#475569] text-xs font-medium flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Download size={14} />
              Export Records
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="h-10 rounded-xl border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-[#EF4444]/5"
            >
              <LogOut size={14} />
              Sign Out Account
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
