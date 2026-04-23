"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Dumbbell, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0D0D14] flex items-center justify-center px-4">
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
        <p className="text-center text-sm text-[#94A3B8] mb-8">Your gym. Fully in control.</p>

        <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-6">
          <h1 className="text-xl font-semibold text-[#F1F5F9] mb-1">Welcome back</h1>
          <p className="text-sm text-[#94A3B8] mb-6">Sign in to manage your gym</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#94A3B8]">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 rounded-xl bg-[#1C1C2E] border border-[#1E1E30] px-4 pr-12 text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#6366F1] text-white font-semibold active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#94A3B8] mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#6366F1] font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
