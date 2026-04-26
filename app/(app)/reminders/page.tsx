import { getCachedUser, getCachedGym } from "@/lib/supabase/cached-queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RemindersClient from "./RemindersClient";

export default async function RemindersPage() {
  const user = await getCachedUser();
  if (!user) redirect("/login");

  const gym = await getCachedGym(user.id);
  if (!gym) redirect("/register");

  const supabase = await createClient();

  const [
    { data: fiveDays },
    { data: threeDays },
    { data: oneDay },
    { data: reminders },
  ] = await Promise.all([
    supabase.from("v_member_status").select("id, gym_id, full_name, phone, end_date, plan_name, subscription_id, days_until_expiry, photo_url").eq("gym_id", gym.id).eq("days_until_expiry", 5).not("subscription_id", "is", null),
    supabase.from("v_member_status").select("id, gym_id, full_name, phone, end_date, plan_name, subscription_id, days_until_expiry, photo_url").eq("gym_id", gym.id).eq("days_until_expiry", 3).not("subscription_id", "is", null),
    supabase.from("v_member_status").select("id, gym_id, full_name, phone, end_date, plan_name, subscription_id, days_until_expiry, photo_url").eq("gym_id", gym.id).eq("days_until_expiry", 0).not("subscription_id", "is", null),
    supabase.from("reminders").select("*").eq("gym_id", gym.id).order("sent_at", { ascending: false }).limit(50),
  ]);

  return (
    <RemindersClient
      gym={gym}
      fiveDays={fiveDays ?? []}
      threeDays={threeDays ?? []}
      oneDay={oneDay ?? []}
      history={reminders ?? []}
    />
  );
}
