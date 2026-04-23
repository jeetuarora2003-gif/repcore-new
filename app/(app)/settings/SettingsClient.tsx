"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Save, Eye, EyeOff, Building2, MessageCircle, FileText, Download } from "lucide-react";
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
        toast.success("Settings saved!");
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
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0D0D14]/95 backdrop-blur-md border-b border-[#1E1E30] px-4 py-3">
        <h1 className="text-lg font-bold text-[#F1F5F9]">Settings</h1>
      </div>

      <form onSubmit={handleSave} className="px-4 py-4 space-y-5">
        {/* Gym Profile */}
        <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-[#1E1E30]">
            <div className="h-8 w-8 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
              <Building2 size={16} className="text-[#6366F1]" />
            </div>
            <p className="text-sm font-semibold text-[#F1F5F9]">Gym Profile</p>
          </div>

          {/* Logo circle */}
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-2xl font-bold">
              {memberInitials(form.name || "G")}
            </div>
          </div>

          {[
            { field: "name", label: "Gym Name", placeholder: "Your gym name", type: "text" },
            { field: "address", label: "Address", placeholder: "Full address", type: "text" },
            { field: "phone", label: "Phone", placeholder: "+91 98765 43210", type: "tel" },
          ].map(({ field, label, placeholder, type }) => (
            <div key={field}>
              <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">{label}</label>
              <input
                type={type}
                value={form[field as keyof typeof form]}
                onChange={e => handleChange(field, e.target.value)}
                placeholder={placeholder}
                className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] text-sm"
              />
            </div>
          ))}
        </div>

        {/* Prefixes */}
        <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-[#1E1E30]">
            <div className="h-8 w-8 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
              <FileText size={16} className="text-[#F59E0B]" />
            </div>
            <p className="text-sm font-semibold text-[#F1F5F9]">Document Prefixes</p>
          </div>

          {[
            { field: "receipt_prefix", label: "Receipt Prefix" },
            { field: "invoice_prefix", label: "Invoice Prefix" },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">{label}</label>
              <input
                type="text"
                value={form[field as keyof typeof form]}
                onChange={e => handleChange(field, e.target.value)}
                className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] text-sm"
              />
              <p className="text-xs text-[#94A3B8] mt-1">
                Preview: {form[field as keyof typeof form]}-{new Date().getFullYear()}-0001
              </p>
            </div>
          ))}
        </div>

        {/* WhatsApp */}
        <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-[#1E1E30]">
            <div className="h-8 w-8 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
              <MessageCircle size={16} className="text-[#22C55E]" />
            </div>
            <p className="text-sm font-semibold text-[#F1F5F9]">WhatsApp Integration</p>
          </div>

          <div>
            <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={form.whatsapp_api_key}
                onChange={e => handleChange("whatsapp_api_key", e.target.value)}
                placeholder="Your WhatsApp API key"
                className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 pr-12 text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="bg-[#1C1C2E] rounded-xl p-3 flex justify-between items-center">
            <span className="text-sm text-[#94A3B8]">Credits Balance</span>
            <span className="text-sm font-bold text-[#F1F5F9]">{gym.whatsapp_credits}</span>
          </div>

          <button
            type="button"
            disabled={!form.whatsapp_api_key}
            className="w-full h-12 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => {
              const msg = encodeURIComponent("Test message from RepCore! Your WhatsApp integration is working.");
              window.open(`https://wa.me/91${gym.phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
            }}
          >
            <MessageCircle size={16} />
            Test Message
          </button>
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-xl bg-[#6366F1] text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
        >
          <Save size={16} />
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </form>

      {/* Account Section */}
      <div className="px-4 pb-8 space-y-3">
        <button
          disabled
          className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] text-[#94A3B8]/50 font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <Download size={16} />
          Export Data (Coming Soon)
        </button>

        <button
          onClick={handleSignOut}
          className="w-full h-12 rounded-xl border border-[#EF4444]/50 text-[#EF4444] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform duration-100 hover:bg-[#EF4444]/10"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
