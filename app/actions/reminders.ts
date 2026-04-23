"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function sendReminder(
  memberId: string,
  subscriptionId: string,
  stage: number,
  gymId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("id", gymId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!gym) return { success: false, error: "Unauthorized" };

  const { error } = await supabase.from("reminders").insert({
    gym_id: gymId,
    member_id: memberId,
    subscription_id: subscriptionId,
    stage,
    method: "manual_whatsapp",
  });
  if (error) return { success: false, error: error.message };

  // Stamp the subscription so auto-engine knows it was sent
  const sentAtField = stage === 5 ? "reminder_5_sent_at" : 
                      stage === 3 ? "reminder_3_sent_at" : 
                      "reminder_1_sent_at";
  
  await supabase
    .from("subscriptions")
    // @ts-expect-error
    .update({ [sentAtField]: new Date().toISOString() })
    .eq("id", subscriptionId);

  revalidatePath("/reminders");
  return { success: true };
}

// Keep backward compat alias
export const markReminderSent = sendReminder;
