"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getOrCreateGym() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data } = await supabase
    .from("gyms")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  return data;
}

export async function updateGymSettings(gymId: string, formData: {
  name?: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  whatsapp_api_key?: string;
  receipt_prefix?: string;
  invoice_prefix?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("gyms")
    .update(formData)
    .eq("id", gymId)
    .eq("owner_id", user.id);

  if (error) throw error;
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
