"use client";

import { useGym } from "@/components/providers/GymProvider";
import MemberDetailClient from "./MemberDetailClient";
import useSWR from "swr";
import { swrFetcher } from "@/lib/swr-fetcher";
import { useParams } from "next/navigation";

export default function MemberDetailPage() {
  const { id } = useParams();
  const { gym } = useGym();

  const { data } = useSWR(
    id ? `/api/members/${id}` : null,
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
    <MemberDetailClient
      gym={gym as any}
      member={data.member}
      invoices={data.invoices}
      payments={data.payments}
      attendance={data.attendance}
      plans={data.plans}
    />
  );
}
