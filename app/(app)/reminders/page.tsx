"use client";

import { useGym } from "@/components/providers/GymProvider";
import RemindersClient from "./RemindersClient";
import useSWR from "swr";
import { swrFetcher } from "@/lib/swr-fetcher";

export default function RemindersPage() {
  const { gym } = useGym();

  // Fetch reminders using SWR for instant loading
  const { data, error } = useSWR(
    `/api/reminders`,
    swrFetcher,
    { revalidateOnFocus: false }
  );

  return (
    <RemindersClient
      gym={gym as any}
      fiveDays={data?.fiveDays ?? []}
      threeDays={data?.threeDays ?? []}
      oneDay={data?.oneDay ?? []}
      history={data?.history ?? []}
    />
  );
}
