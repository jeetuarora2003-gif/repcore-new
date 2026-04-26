"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { GymProvider } from "@/components/providers/GymProvider";
import type { Gym } from "@/lib/supabase/types";
import { useRouter } from "next/navigation";

interface Props {
  gym: Gym;
  children: React.ReactNode;
}

export default function AppLayoutClient({ gym, children }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const router = useRouter();

  // Simple Pull-to-refresh logic
  useEffect(() => {
    let startY = 0;
    const threshold = 120;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].pageY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY === 0) return;
      const currentY = e.touches[0].pageY;
      const distance = currentY - startY;
      
      if (distance > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(distance * 0.4, threshold));
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance >= 40) {
        setRefreshing(true);
        router.refresh();
        setTimeout(() => {
          setRefreshing(false);
          setPullDistance(0);
        }, 1000);
      } else {
        setPullDistance(0);
      }
      startY = 0;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, router]);

  return (
    <>
      {/* Pull to refresh indicator */}
      <div 
        className="fixed top-0 left-0 right-0 z-[100] flex justify-center transition-all duration-200 pointer-events-none"
        style={{ 
          transform: `translateY(${pullDistance - 40}px)`,
          opacity: pullDistance > 10 ? 1 : 0 
        }}
      >
        <div className="bg-white rounded-full p-2 shadow-lg border border-border">
          <div className={`h-6 w-6 border-2 border-accent border-t-transparent rounded-full ${refreshing ? "animate-spin" : ""}`} />
        </div>
      </div>

      <GymProvider gym={gym}>
        <AppShell gym={gym}>{children}</AppShell>
      </GymProvider>
    </>
  );
}
