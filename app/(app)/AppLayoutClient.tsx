"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import AppShell from "@/components/AppShell";
import type { Gym } from "@/lib/supabase/types";

interface Props {
  gym: Gym;
  children: React.ReactNode;
}

export default function AppLayoutClient({ gym, children }: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <LoadingScreen />}
      <AppShell gym={gym}>{children}</AppShell>
    </>
  );
}
