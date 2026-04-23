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
    <div className={`fixed inset-0 z-[100] bg-[#09090B]/80 backdrop-blur-3xl flex flex-col items-center justify-center transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
      <div className="flex flex-col items-center gap-4 animate-breathe">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#10B981] flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
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
      </div>
    </div>
  );
}
