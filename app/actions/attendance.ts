"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function checkIn(memberId: string, gymId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("id", gymId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!gym) throw new Error("Unauthorized");

  const { data: record, error } = await supabase
    .from("attendance")
    .insert({ gym_id: gymId, member_id: memberId })
    .select()
    .single();
  if (error) throw error;

  revalidatePath("/checkin");
  revalidatePath(`/members/${memberId}`);
  revalidatePath("/dashboard");
  return record;
}
