"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { encrypt } from "@/lib/crypto";

export async function updateReminderModeAction(gymId: string, mode: 'manual' | 'auto') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("gyms")
    // @ts-expect-error
    .update({ whatsapp_reminder_mode: mode })
    .eq("id", gymId)
    .eq("owner_id", user.id);

  if (error) throw error;
  
  revalidatePath("/settings/whatsapp");
}

export async function updateWhatsappConfigAction(gymId: string, data: { phone: string, apiKey: string, mode: 'auto' }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const encryptedKey = encrypt(data.apiKey);

  const { error } = await supabase
    .from("gyms")
    // @ts-expect-error
    .update({ 
      whatsapp_phone_number: data.phone,
      whatsapp_api_key: encryptedKey,
      whatsapp_reminder_mode: data.mode
    })
    .eq("id", gymId)
    .eq("owner_id", user.id);

  if (error) throw error;
  
  revalidatePath("/settings/whatsapp");
}
