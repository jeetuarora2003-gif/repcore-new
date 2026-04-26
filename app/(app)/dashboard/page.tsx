"use client";

import { useGym } from "@/components/providers/GymProvider";
import DashboardClient from "./DashboardClient";
import useSWR from "swr";
import { swrFetcher } from "@/lib/swr-fetcher";

export default function DashboardPage() {
  const { gym } = useGym();

  const { data, error } = useSWR(
    `/api/dashboard`,
    swrFetcher,
    { revalidateOnFocus: false }
  );

  return (
    <DashboardClient
      gym={gym as any}
      statsPromise={data ? Promise.resolve(data.stats) : new Promise(() => {})}
      recentCheckinsPromise={data ? Promise.resolve(data.recentCheckins) : new Promise(() => {})}
      expiringSoonPromise={data ? Promise.resolve(data.expiringSoon) : new Promise(() => {})}
    />
  );
}
