"use client";

import { useGym } from "@/components/providers/GymProvider";
import RemindersClient from "./RemindersClient";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RemindersPage() {
  const { gym } = useGym();

  // Fetch reminders using SWR for instant loading
  const { data, error } = useSWR(
    `/api/reminders`,
    fetcher,
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
