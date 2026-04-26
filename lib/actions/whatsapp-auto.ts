import type { SupabaseClient } from "@supabase/supabase-js";
import { decrypt } from "@/lib/crypto";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/helpers";
import { formatIndianWhatsappNumber } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database, Gym, MemberStatus } from "@/lib/supabase/types";

type ReminderStage = 5 | 3 | 1;
type ReminderField = "reminder_5_sent_at" | "reminder_3_sent_at" | "reminder_1_sent_at";

type AutoReminderGym = Pick<
  Gym,
  "id" | "name" | "phone" | "whatsapp_api_key" | "whatsapp_phone_number" | "whatsapp_reminder_mode" | "whatsapp_credits"
>;

type AutoReminderResult = {
  gymId: string;
  sent: number;
  failed: number;
  skippedReason?: string;
  error?: string;
};

type ReminderCandidate = Pick<
  MemberStatus,
  "id" | "gym_id" | "full_name" | "phone" | "end_date" | "plan_name" | "subscription_id" | "days_until_expiry"
> & {
  reminder_5_sent_at?: string | null;
  reminder_3_sent_at?: string | null;
  reminder_1_sent_at?: string | null;
};

const STAGE_TO_FIELD: Record<ReminderStage, ReminderField> = {
  5: "reminder_5_sent_at",
  3: "reminder_3_sent_at",
  1: "reminder_1_sent_at",
};

function getReminderStage(member: ReminderCandidate): ReminderStage | null {
  if (member.days_until_expiry === null) return null;
  if (member.days_until_expiry === 5 && !member.reminder_5_sent_at) return 5;
  if (member.days_until_expiry === 3 && !member.reminder_3_sent_at) return 3;
  if (member.days_until_expiry === 0 && !member.reminder_1_sent_at) return 1;
  return null;
}

async function processAutoRemindersForGym(
  supabase: SupabaseClient<Database>,
  gym: AutoReminderGym
): Promise<AutoReminderResult> {
  if (gym.whatsapp_reminder_mode !== "auto") {
    return { gymId: gym.id, sent: 0, failed: 0, skippedReason: "manual_mode" };
  }

  if (!gym.whatsapp_phone_number || !gym.whatsapp_api_key) {
    return { gymId: gym.id, sent: 0, failed: 0, skippedReason: "missing_config" };
  }

  const apiKey = decrypt(gym.whatsapp_api_key);
  if (!apiKey) {
    return { gymId: gym.id, sent: 0, failed: 0, skippedReason: "invalid_api_key" };
  }

  const { data: members, error } = await supabase
    .from("v_member_status")
    .select(
      "id, gym_id, full_name, phone, end_date, plan_name, subscription_id, days_until_expiry"
    )
    .eq("gym_id", gym.id)
    .in("days_until_expiry", [5, 3, 0])
    .not("subscription_id", "is", null);

  if (error) {
    return {
      gymId: gym.id,
      sent: 0,
      failed: 0,
      error: getFriendlyErrorMessage(error),
    };
  }

  let sent = 0;
  let failed = 0;
  let currentCredits = gym.whatsapp_credits ?? 0;

  for (const member of members ?? []) {
    if (currentCredits <= 0) break;

    const stage = getReminderStage(member);
    if (!stage || !member.subscription_id) continue;

    const sentField = STAGE_TO_FIELD[stage];

    const destination = formatIndianWhatsappNumber(member.phone);
    if (!destination) {
      failed += 1;
      continue;
    }

    try {
      const response = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AiSensy-Project-API-PWD": apiKey,
        },
        body: JSON.stringify({
          apiKey,
          campaignName: `repcore_reminder_${stage}`,
          destination,
          userName: gym.name,
          templateParams: [member.full_name, gym.name, formatDate(member.end_date), String(stage)],
        }),
      });

      const result = (await response.json().catch(() => null)) as { success?: boolean } | null;
      if (!response.ok || !result?.success) {
        failed += 1;
        continue;
      }

      const stampAt = new Date().toISOString();
      const stampPayload = {
        [sentField]: stampAt,
      } as Pick<Database["public"]["Tables"]["subscriptions"]["Update"], ReminderField>;

      const [{ error: stampError }, { error: reminderError }] = await Promise.all([
        supabase
          .from("subscriptions")
          .update(stampPayload)
          .eq("id", member.subscription_id),
        supabase.from("reminders").insert({
          gym_id: gym.id,
          member_id: member.id,
          subscription_id: member.subscription_id,
          stage,
          method: "auto_whatsapp",
        }),
      ]);

      if (stampError || reminderError) {
        failed += 1;
        continue;
      }

      sent += 1;
      currentCredits -= 1;
    } catch {
      failed += 1;
    }
  }

  if (sent > 0) {
    await supabase.from("gyms").update({ whatsapp_credits: currentCredits }).eq("id", gym.id);
  }

  return { gymId: gym.id, sent, failed };
}

export async function sendAutoRemindersForGym(gymId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: gym, error } = await supabase
    .from("gyms")
    .select("id, name, phone, whatsapp_api_key, whatsapp_phone_number, whatsapp_reminder_mode, whatsapp_credits")
    .eq("id", gymId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !gym) {
    return { success: false, error: "Unauthorized" };
  }

  return processAutoRemindersForGym(supabase, gym);
}

export async function sendAutoRemindersForAllGyms() {
  const supabase = createAdminClient();
  const { data: gyms, error } = await supabase
    .from("gyms")
    .select("id, name, phone, whatsapp_api_key, whatsapp_phone_number, whatsapp_reminder_mode, whatsapp_credits")
    .eq("whatsapp_reminder_mode", "auto");

  if (error) {
    throw new Error(getFriendlyErrorMessage(error));
  }

  const results: AutoReminderResult[] = [];
  const promises = (gyms ?? []).map((gym) => processAutoRemindersForGym(supabase, gym));
  const settled = await Promise.allSettled(promises);

  for (const outcome of settled) {
    if (outcome.status === "fulfilled") {
      results.push(outcome.value);
    }
  }

  return results;
}
