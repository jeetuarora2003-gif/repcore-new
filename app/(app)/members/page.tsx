"use client";

import { useGym } from "@/components/providers/GymProvider";
import MembersClient from "./MembersClient";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { swrFetcher } from "@/lib/swr-fetcher";

export default function MembersPage() {
  const { gym } = useGym();
  const supabase = createClient();

  // Fetch members using SWR for instant "Zero-Lag" loading
  const { data: members } = useSWR(
    `/api/members`,
    swrFetcher,
    { revalidateOnFocus: false }
  );

  // We still fetch plans for the "Add Member" modal
  const { data: plans } = useSWR(
    gym.id ? `plans-${gym.id}` : null,
    async () => {
      const { data } = await supabase
        .from("plans")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("is_active", true)
        .order("price", { ascending: true });
      return data ?? [];
    }
  );

  return (
    <MembersClient 
      gymId={gym.id} 
      members={members ?? []} 
      plans={plans ?? []} 
    />
  );
}
