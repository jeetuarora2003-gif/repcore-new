"use client";

import { useGym } from "@/components/providers/GymProvider";
import ReportsClient from "./ReportsClient";
import useSWR from "swr";
import { swrFetcher } from "@/lib/swr-fetcher";

export default function ReportsPage() {
  const { gym } = useGym();

  const { data } = useSWR(
    `/api/reports`,
    swrFetcher,
    { revalidateOnFocus: false }
  );

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <ReportsClient
      monthRevenue={data.monthRevenue}
      newMembersCount={data.newMembersCount}
      totalDues={data.totalDues}
      monthlyRevenue={data.monthlyRevenue}
      methodBreakdown={data.methodBreakdown}
      statusBreakdown={data.statusBreakdown}
    />
  );
}
