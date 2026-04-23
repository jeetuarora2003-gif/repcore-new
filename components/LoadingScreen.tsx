"use client";

import React, { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090B] flex flex-col items-center justify-center animate-fade-in transition-opacity duration-400">
      <div className="flex flex-col items-center gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#10B981] flex items-center justify-center shadow-lg shadow-[#10B981]/30">
            <Dumbbell size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-[#10B981]">Rep</span>
              <span className="text-[#FAFAFA]">Core</span>
            </span>
            <span className="text-[10px] text-[#71717A] font-bold tracking-[0.25em] uppercase -mt-1 ml-0.5">
              Gym Management
            </span>
          </div>
        </div>
      </div>

      {/* Loading Bar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-white/3 overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-[#10B981] via-indigo-400 to-[#10B981] animate-progress-bar" />
      </div>

      <style jsx>{`
        @keyframes progressBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-bar {
          animation: progressBar 1.2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
