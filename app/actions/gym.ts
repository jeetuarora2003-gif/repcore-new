"use server";

import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";
import { getFriendlyErrorMessage } from "@/lib/errors";
import type { Database } from "@/lib/supabase/types";
import { gymSettingsSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function getOrCreateGym() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data } = await supabase
    .from("gyms")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  return data;
}

export async function updateGymSettings(
  gymId: string,
  formData: {
    name?: string;
    address?: string;
    phone?: string;
    logo_url?: string;
    whatsapp_api_key?: string;
    receipt_prefix?: string;
    invoice_prefix?: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const parsed = gymSettingsSchema.parse(formData);
  const safeData: Database["public"]["Tables"]["gyms"]["Update"] = {};

  if (parsed.name !== undefined) safeData.name = parsed.name;
  if (parsed.address !== undefined) safeData.address = parsed.address;
  if (parsed.phone !== undefined) safeData.phone = parsed.phone;
  if (parsed.logo_url !== undefined) safeData.logo_url = parsed.logo_url;
  if (parsed.receipt_prefix !== undefined) safeData.receipt_prefix = parsed.receipt_prefix.toUpperCase();
  if (parsed.invoice_prefix !== undefined) safeData.invoice_prefix = parsed.invoice_prefix.toUpperCase();

  if (parsed.whatsapp_api_key) {
    safeData.whatsapp_api_key = encrypt(parsed.whatsapp_api_key);
  }

  const { error } = await supabase
    .from("gyms")
    .update(safeData)
    .eq("id", gymId)
    .eq("owner_id", user.id);

  if (error) {
    throw new Error(getFriendlyErrorMessage(error));
  }

  revalidatePath("/settings");
  revalidatePath("/settings/whatsapp");
  revalidatePath("/dashboard");
}
