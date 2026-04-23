"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Dumbbell, Eye, EyeOff, ChevronRight } from "lucide-react";
import { cleanPhone } from "@/lib/helpers";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    ownerName: "",
    gymName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  function onChange(field: string, value: string) {
    if (field === "phone") {
      setForm(p => ({ ...p, [field]: cleanPhone(value) }));
      return;
    }
    setForm(p => ({ ...p, [field]: value }));
  }

  function handleNext() {
    if (step === 1 && form.ownerName && form.gymName && form.phone) {
      setStep(2);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.ownerName } },
    });

    if (authErr) {
      toast.error(authErr.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      toast.error("Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    const { error: gymErr } = await supabase.from("gyms").insert({
      owner_id: userId,
      name: form.gymName,
      phone: form.phone,
    });

    if (gymErr) {
      toast.error(`Gym setup failed: ${gymErr.message}`);
      setLoading(false);
      return;
    }

    toast.success("Welcome to RepCore!");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-12">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-96 bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10 group">
          <div className="h-10 w-10 rounded-2xl bg-[#10B981] flex items-center justify-center shadow-lg shadow-[#10B981]/20 group-hover:scale-105 transition-transform">
            <Dumbbell size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-[#10B981]">Rep</span>
              <span className="text-[#E4E4E7]">Core</span>
            </span>
            <span className="text-[10px] text-[#71717A] font-bold tracking-[0.25em] uppercase -mt-1 ml-0.5">
              Gym Management
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`h-1 w-12 rounded-full transition-all ${step >= 1 ? "bg-[#10B981]" : "bg-white/5"}`} />
          <div className={`h-1 w-12 rounded-full transition-all ${step >= 2 ? "bg-[#10B981]" : "bg-white/5"}`} />
        </div>

        <div className="card p-8 bg-surface/50 backdrop-blur-sm border-white/6">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#E4E4E7] mb-1">Set up your gym</h1>
                <p className="text-sm text-[#A1A1AA]">Step 1 — Business Information</p>
              </div>

              <div className="space-y-5">
                {[
                  { field: "ownerName", label: "Owner Name", placeholder: "John Smith", type: "text" },
                  { field: "gymName", label: "Gym Name", placeholder: "Flex Fitness", type: "text" },
                  { field: "phone", label: "Phone Number", placeholder: "98765 43210", type: "tel" },
                ].map(({ field, label, placeholder, type }) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-xs font-medium text-[#A1A1AA]">{label}</label>
                    <input
                      type={type}
                      required
                      value={form[field as keyof typeof form]}
                      onChange={e => onChange(field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full h-11 rounded-xl bg-[#09090B] border border-white/8 px-4 text-sm text-[#E4E4E7] placeholder-[#71717A] focus:outline-none focus:border-[#10B981]/40 focus:ring-4 focus:ring-[#10B981]/5 transition-all"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full h-12 rounded-xl bg-[#10B981] text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-[#10B981]/20 mt-2"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#E4E4E7] mb-1">Secure account</h1>
                <p className="text-sm text-[#A1A1AA]">Step 2 — Access Credentials</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A1A1AA]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => onChange("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 rounded-xl bg-[#09090B] border border-white/8 px-4 text-sm text-[#E4E4E7] placeholder-[#71717A] focus:outline-none focus:border-[#10B981]/40 focus:ring-4 focus:ring-[#10B981]/5 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A1A1AA]">Account Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      minLength={6}
                      value={form.password}
                      onChange={e => onChange("password", e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full h-11 rounded-xl bg-[#09090B] border border-white/8 px-4 pr-12 text-sm text-[#E4E4E7] placeholder-[#71717A] focus:outline-none focus:border-[#10B981]/40 focus:ring-4 focus:ring-[#10B981]/5 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#E4E4E7]"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 rounded-xl bg-surface border border-white/6 text-[#A1A1AA] text-sm font-semibold active:scale-[0.98] transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] h-12 rounded-xl bg-[#10B981] text-white text-sm font-semibold active:scale-[0.98] transition-all shadow-lg shadow-[#10B981]/20 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Finish Setup"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <p className="text-center text-sm text-[#A1A1AA] mt-10">
            Already have an account?{" "}
            <Link href="/login" className="text-[#10B981] font-semibold hover:underline decoration-[#10B981]/30 underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
