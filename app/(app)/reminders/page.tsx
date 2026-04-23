import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RemindersClient from "./RemindersClient";
import { sendAutoRemindersForGym } from "@/lib/actions/whatsapp-auto";

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

  // Trigger auto-reminders engine (non-blocking if possible, but for now simple)
  // This handles the daily background sending logic when someone visits the dashboard
  await sendAutoRemindersForGym(gym.id);

  const [
    { data: fiveDays },
    { data: threeDays },
    { data: oneDay },
    { data: reminders },
  ] = await Promise.all([
    supabase.from("v_member_status").select("*").eq("gym_id", gym.id).eq("days_until_expiry", 5),
    supabase.from("v_member_status").select("*").eq("gym_id", gym.id).eq("days_until_expiry", 3),
    supabase.from("v_member_status").select("*").eq("gym_id", gym.id).eq("days_until_expiry", 1),
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
