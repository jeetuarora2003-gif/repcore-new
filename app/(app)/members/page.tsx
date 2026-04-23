import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MembersClient from "./MembersClient";

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!gym) redirect("/register");

  const { data: members } = await supabase
    .from("v_member_status")
    .select("id, full_name, phone, photo_url, plan_name, balance_due, status")
    .eq("gym_id", gym.id)
    .order("full_name")
    .limit(50);

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("gym_id", gym.id)
    .eq("is_active", true)
    .order("price", { ascending: true });

  return <MembersClient gymId={gym.id} members={members ?? []} plans={plans ?? []} />;
}
