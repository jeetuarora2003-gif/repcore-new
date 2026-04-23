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
      toast.error("Account created but failed to set up gym. Please contact support.");
      setLoading(false);
      return;
    }

    toast.success("Welcome to RepCore!");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0D0D14] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-10 w-10 rounded-2xl bg-[#6366F1] flex items-center justify-center">
            <Dumbbell size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold">
            <span className="text-[#6366F1]">Rep</span>
            <span className="text-[#F1F5F9]">Core</span>
          </span>
        </div>
        <p className="text-center text-sm text-[#94A3B8] mb-6">Your gym. Fully in control.</p>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? "bg-[#6366F1]" : "bg-[#1E1E30]"}`} />
          <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? "bg-[#6366F1]" : "bg-[#1E1E30]"}`} />
        </div>

        <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-6">
          {step === 1 ? (
            <>
              <h1 className="text-xl font-semibold text-[#F1F5F9] mb-1">Set up your gym</h1>
              <p className="text-sm text-[#94A3B8] mb-6">Step 1 — Tell us about your gym</p>

              <div className="space-y-4">
                {[
                  { field: "ownerName", label: "Your Name", placeholder: "John Smith", type: "text" },
                  { field: "gymName", label: "Gym Name", placeholder: "Flex Fitness", type: "text" },
                  { field: "phone", label: "Phone Number", placeholder: "+91 98765 43210", type: "tel" },
                ].map(({ field, label, placeholder, type }) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-sm font-medium text-[#94A3B8]">{label}</label>
                    <input
                      type={type}
                      required
                      value={form[field as keyof typeof form]}
                      onChange={e => onChange(field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] transition-colors text-sm"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full h-12 rounded-xl bg-[#6366F1] text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  Continue
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-[#F1F5F9] mb-1">Create your account</h1>
              <p className="text-sm text-[#94A3B8] mb-6">Step 2 — Set up your login credentials</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#94A3B8]">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => onChange("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] transition-colors text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#94A3B8]">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      minLength={6}
                      value={form.password}
                      onChange={e => onChange("password", e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 pr-12 text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] text-[#94A3B8] font-semibold active:scale-95 transition-transform"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-[#6366F1] text-white font-semibold active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Setting up..." : "Create Account"}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-[#94A3B8] mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-[#6366F1] font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
