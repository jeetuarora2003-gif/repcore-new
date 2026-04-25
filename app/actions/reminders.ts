"use server";

import { z } from "zod";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";

const reminderSchema = z.object({
  memberId: z.string().uuid("Invalid member."),
  subscriptionId: z.string().uuid("Invalid subscription."),
  stage: z.union([z.literal(5), z.literal(3), z.literal(1)]),
  gymId: z.string().uuid("Invalid gym."),
});

const STAGE_TO_FIELD = {
  5: "reminder_5_sent_at",
  3: "reminder_3_sent_at",
  1: "reminder_1_sent_at",
} as const;

export async function sendReminder(
  memberId: string,
  subscriptionId: string,
  stage: number,
  gymId: string
) {
  const parsed = reminderSchema.parse({ memberId, subscriptionId, stage, gymId });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("id", parsed.gymId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!gym) return { success: false, error: "Unauthorized" };

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("id", parsed.memberId)
    .eq("gym_id", parsed.gymId)
    .maybeSingle();

  if (!member) return { success: false, error: "Member not found" };

  const { error } = await supabase.from("reminders").insert({
    gym_id: parsed.gymId,
    member_id: parsed.memberId,
    subscription_id: parsed.subscriptionId,
    stage: parsed.stage,
    method: "manual_whatsapp",
  });

  if (error) {
    return { success: false, error: getFriendlyErrorMessage(error) };
  }

  const stampPayload = {
    [STAGE_TO_FIELD[parsed.stage]]: new Date().toISOString(),
  } as Pick<Database["public"]["Tables"]["subscriptions"]["Update"], typeof STAGE_TO_FIELD[typeof parsed.stage]>;

  const stampError = await supabase
    .from("subscriptions")
    .update(stampPayload)
    .eq("id", parsed.subscriptionId)
    .eq("gym_id", parsed.gymId)
    .then(({ error: updateError }) => updateError);

  if (stampError) {
    return { success: false, error: getFriendlyErrorMessage(stampError) };
  }

  revalidatePath("/reminders");
  revalidatePath(`/members/${parsed.memberId}`);

  return { success: true };
}

export const markReminderSent = sendReminder;
