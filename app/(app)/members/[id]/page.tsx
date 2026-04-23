import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import MemberDetailClient from "./MemberDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: gym } = await supabase
    .from("gyms")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!gym) redirect("/register");

  const [
    { data: member },
    { data: invoices },
    { data: payments },
    { data: attendance },
    { data: plans },
  ] = await Promise.all([
    supabase.from("v_member_status").select("*").eq("id", id).eq("gym_id", gym.id).maybeSingle(),
    supabase.from("invoices").select("*").eq("member_id", id).order("created_at", { ascending: false }),
    supabase.from("payments").select("*").eq("member_id", id).order("paid_at", { ascending: false }),
    supabase.from("attendance").select("*").eq("member_id", id).order("checked_in_at", { ascending: false }).limit(60),
    supabase.from("plans").select("*").eq("gym_id", gym.id).eq("is_active", true),
  ]);

  if (!member) notFound();

  return (
    <MemberDetailClient
      gym={gym}
      member={member}
      invoices={invoices ?? []}
      payments={payments ?? []}
      attendance={attendance ?? []}
      plans={plans ?? []}
    />
  );
}
