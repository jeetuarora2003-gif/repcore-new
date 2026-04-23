import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DuesClient from "./DuesClient";

export default async function DuesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!gym) redirect("/register");

  // Fetch total dues amount
  const { data: stats } = await supabase.rpc("get_dashboard_stats", { p_gym_id: gym.id });
  const totalDues = stats?.dues ?? 0;

  // Fetch first 50 members with pending balance
  const { data: members } = await supabase
    .from("v_member_status")
    .select("*")
    .eq("gym_id", gym.id)
    .gt("balance_due", 0)
    .order("balance_due", { ascending: false })
    .limit(50);

  return <DuesClient gymId={gym.id} members={members ?? []} totalDues={totalDues} />;
}
