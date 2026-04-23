"use client";

import { Dumbbell } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#0D0D14] flex flex-col items-center justify-center overflow-hidden">
      {/* Center Logo */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#6366F1] flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
            <Dumbbell size={24} className="text-white" />
          </div>
          <span className="text-4xl font-extrabold tracking-tighter">
            <span className="text-[#6366F1]">Rep</span>
            <span className="text-white">Core</span>
          </span>
        </div>

        {/* 3 Animated Dots (using Tailwind's pulse) */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Google-style Bottom Loading Bar (using a simple CSS animation) */}
      <div className="fixed bottom-0 left-0 right-0 h-0.5 bg-white/5 overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#6366F1] animate-progress-bar" />
      </div>

      <style jsx>{`
        @keyframes progressBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-bar {
          animation: progressBar 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
