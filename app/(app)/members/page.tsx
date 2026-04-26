import { getCachedUser, getCachedGym } from "@/lib/supabase/cached-queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MembersClient from "./MembersClient";

export default async function MembersPage() {
  const user = await getCachedUser();
  if (!user) redirect("/login");

  const gym = await getCachedGym(user.id);
  if (!gym) redirect("/register");

  const supabase = await createClient();

  // Parallel fetching reduces loading time by 50%
  const [membersRes, plansRes] = await Promise.all([
    supabase
      .from("v_member_status")
      .select("id, full_name, phone, photo_url, plan_name, balance_due, status")
      .eq("gym_id", gym.id)
      .order("full_name")
      .limit(50),
    supabase
      .from("plans")
      .select("*")
      .eq("gym_id", gym.id)
      .eq("is_active", true)
      .order("price", { ascending: true })
  ]);

  return (
    <MembersClient 
      gymId={gym.id} 
      members={membersRes.data ?? []} 
      plans={plansRes.data ?? []} 
    />
  );
}
