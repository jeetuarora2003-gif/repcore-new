"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type { Gym } from "@/lib/supabase/types";

interface GymContextType {
  gym: Pick<Gym, "id" | "name" | "slug">;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export function GymProvider({ children, gym }: { children: ReactNode; gym: Pick<Gym, "id" | "name" | "slug"> }) {
  return (
    <GymContext.Provider value={{ gym }}>
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error("useGym must be used within a GymProvider");
  }
  return context;
}
