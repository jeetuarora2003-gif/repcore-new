import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PlansClient from "./PlansClient";

export default async function PlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!gym) redirect("/register");

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("gym_id", gym.id)
    .order("price");

  return <PlansClient gymId={gym.id} plans={plans ?? []} />;
}
