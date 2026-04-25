import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RemindersClient from "./RemindersClient";

export default async function RemindersPage() {
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
    { data: fiveDays },
    { data: threeDays },
    { data: oneDay },
    { data: reminders },
  ] = await Promise.all([
    supabase.from("v_member_status").select("id, gym_id, full_name, phone, end_date, plan_name, subscription_id, days_until_expiry, reminder_5_sent_at, reminder_3_sent_at, reminder_1_sent_at, photo_url").eq("gym_id", gym.id).eq("days_until_expiry", 5).not("subscription_id", "is", null),
    supabase.from("v_member_status").select("id, gym_id, full_name, phone, end_date, plan_name, subscription_id, days_until_expiry, reminder_5_sent_at, reminder_3_sent_at, reminder_1_sent_at, photo_url").eq("gym_id", gym.id).eq("days_until_expiry", 3).not("subscription_id", "is", null),
    supabase.from("v_member_status").select("id, gym_id, full_name, phone, end_date, plan_name, subscription_id, days_until_expiry, reminder_5_sent_at, reminder_3_sent_at, reminder_1_sent_at, photo_url").eq("gym_id", gym.id).eq("days_until_expiry", 0).not("subscription_id", "is", null),
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
