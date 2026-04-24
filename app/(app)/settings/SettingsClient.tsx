"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Save, Eye, EyeOff, Building2, MessageCircle, FileText, Download, Zap, ChevronRight, Loader2 } from "lucide-react";
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
    whatsapp_api_key: "",
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
    <div className="pb-24 min-h-screen bg-page animate-fade-up">
      <form onSubmit={handleSave} className="px-4 py-8 md:px-8 max-w-2xl space-y-8 mx-auto">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Settings</h1>
          <p className="text-sm text-text-muted font-medium">Manage your gym profile and system configurations.</p>
        </div>

        {/* Gym Profile */}
        <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Business Profile</h3>
                <p className="text-xs text-text-muted font-medium">Public information about your gym</p>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-page border-2 border-border flex items-center justify-center text-accent text-sm font-bold shadow-inner">
              {memberInitials(form.name || "G")}
            </div>
          </div>

          <div className="grid gap-6">
            {[
              { field: "name", label: "Gym Name", placeholder: "Your gym name", type: "text" },
              { field: "address", label: "Business Address", placeholder: "Street, City, State", type: "text" },
              { field: "phone", label: "Official Contact Number", placeholder: "98765 43210", type: "tel" },
            ].map(({ field, label, placeholder, type }) => (
              <div key={field} className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">{label}</label>
                <input
                  type={type}
                  value={form[field as keyof typeof form]}
                  onChange={e => handleChange(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full h-12 rounded-xl bg-white border border-border px-4 text-sm text-text-primary font-semibold placeholder-text-muted focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* System Config */}
        <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="h-10 w-10 rounded-xl bg-status-expired-bg flex items-center justify-center text-status-expired-text">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">System Configuration</h3>
              <p className="text-xs text-text-muted font-medium">Customize prefixes for your invoices and receipts</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { field: "receipt_prefix", label: "Receipt Prefix" },
              { field: "invoice_prefix", label: "Invoice Prefix" },
            ].map(({ field, label }) => (
              <div key={field} className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">{label}</label>
                <input
                  type="text"
                  value={form[field as keyof typeof form]}
                  onChange={e => handleChange(field, e.target.value)}
                  className="w-full h-12 rounded-xl bg-white border border-border px-4 text-sm text-text-primary font-mono focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all uppercase shadow-sm"
                />
                <p className="text-[10px] text-text-muted font-bold tracking-wider pl-1 uppercase opacity-60">
                  Preview: {form[field as keyof typeof form] || "REP"}-{new Date().getFullYear()}-0001
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Integration */}
        <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">WhatsApp Integration</h3>
              <p className="text-xs text-text-muted font-medium">Connect your WhatsApp Cloud API</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">WhatsApp API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={form.whatsapp_api_key}
                  onChange={e => handleChange("whatsapp_api_key", e.target.value)}
                  placeholder="sk-..."
                  className="w-full h-12 rounded-xl bg-white border border-border px-4 pr-12 text-sm text-text-primary font-mono placeholder-text-muted focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Link 
              href="/settings/whatsapp"
              className="flex items-center justify-between p-5 bg-accent/5 border border-accent/20 rounded-2xl hover:bg-accent/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
                  <MessageCircle size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-text-primary">WhatsApp Automation</p>
                  <p className="text-xs text-text-muted font-medium">Configure Auto-reminders via API</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:text-accent transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="space-y-4 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-14 rounded-full bg-accent text-white text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {isPending ? "Updating Settings..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full h-14 rounded-full bg-white border border-status-expired-border text-status-expired-text text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-status-expired-bg"
          >
            <LogOut size={20} />
            Sign Out Account
          </button>
        </div>
      </form>
    </div>
  );
}
