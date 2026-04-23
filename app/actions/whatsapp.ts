"use server";

import { encrypt } from "@/lib/crypto";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { whatsappConfigSchema, whatsappModeSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function updateReminderModeAction(gymId: string, mode: "manual" | "auto") {
  const parsed = whatsappModeSchema.parse({ gymId, mode });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const payload: Database["public"]["Tables"]["gyms"]["Update"] = {
    whatsapp_reminder_mode: parsed.mode,
  };

  const { error } = await supabase
    .from("gyms")
    .update(payload)
    .eq("id", parsed.gymId)
    .eq("owner_id", user.id);

  if (error) throw new Error(getFriendlyErrorMessage(error));

  revalidatePath("/settings/whatsapp");
}

export async function updateWhatsappConfigAction(
  gymId: string,
  data: { phone: string; apiKey: string; mode: "auto" }
) {
  const parsed = whatsappConfigSchema.parse({ gymId, ...data });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const encryptedKey = encrypt(parsed.apiKey);
  const payload: Database["public"]["Tables"]["gyms"]["Update"] = {
    whatsapp_phone_number: parsed.phone,
    whatsapp_api_key: encryptedKey,
    whatsapp_reminder_mode: parsed.mode,
  };

  const { error } = await supabase
    .from("gyms")
    .update(payload)
    .eq("id", parsed.gymId)
    .eq("owner_id", user.id);

  if (error) throw new Error(getFriendlyErrorMessage(error));

  revalidatePath("/settings/whatsapp");
  revalidatePath("/settings");
}
