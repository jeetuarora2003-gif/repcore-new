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
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-96 bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none" />

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

        <div className="card p-8 bg-surface/50 backdrop-blur-sm border-white/6">
          <h1 className="text-2xl font-bold tracking-tight text-[#E4E4E7] mb-1">Welcome back</h1>
          <p className="text-sm text-[#A1A1AA] mb-8">Sign in to manage your gym</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#A1A1AA]">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 rounded-xl bg-[#09090B] border border-white/8 px-4 text-sm text-[#E4E4E7] placeholder-[#71717A] focus:outline-none focus:border-[#10B981]/40 focus:ring-4 focus:ring-[#10B981]/5 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#A1A1AA]">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl bg-[#09090B] border border-white/8 px-4 pr-12 text-sm text-[#E4E4E7] placeholder-[#71717A] focus:outline-none focus:border-[#10B981]/40 focus:ring-4 focus:ring-[#10B981]/5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#E4E4E7] transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl btn-primary text-sm disabled:opacity-50 mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#A1A1AA] mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#10B981] font-semibold hover:underline decoration-[#10B981]/30 underline-offset-4">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
