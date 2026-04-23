"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMember(data: {
  gym_id: string;
  full_name: string;
  phone: string;
  email: string;
  joining_date: string;
  notes: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("id", data.gym_id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!gym) throw new Error("Unauthorized");

  const { data: member, error } = await supabase
    .from("members")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/members");
  return member;
}

export async function toggleFreeze(memberId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: member } = await supabase
    .from("members")
    .select("id, is_frozen, gym_id")
    .eq("id", memberId)
    .maybeSingle();
  if (!member) throw new Error("Member not found");

  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("id", member.gym_id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!gym) throw new Error("Unauthorized");

  const nowFrozen = !member.is_frozen;
  const { error } = await supabase
    .from("members")
    .update({
      is_frozen: nowFrozen,
      frozen_since: nowFrozen ? new Date().toISOString().split("T")[0] : null,
    })
    .eq("id", memberId);

  if (error) throw error;
  revalidatePath(`/members/${memberId}`);
}
