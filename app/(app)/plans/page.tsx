"use client";

import { useGym } from "@/components/providers/GymProvider";
import PlansClient from "./PlansClient";
import useSWR from "swr";
import { swrFetcher } from "@/lib/swr-fetcher";

export default function PlansPage() {
  const { gym } = useGym();

  const { data: plans } = useSWR(
    `/api/plans`,
    swrFetcher,
    { revalidateOnFocus: false }
  );

  return <PlansClient gymId={gym.id} plans={plans ?? []} />;
}
