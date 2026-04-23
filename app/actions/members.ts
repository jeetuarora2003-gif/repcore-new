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

export async function createMembershipSaleAction(data: {
  gym_id: string;
  full_name: string;
  phone: string;
  email?: string;
  notes?: string;
  deviceEnrollmentId?: string;
  photoUrl?: string;
  planId: string;
  startDate: string;
  paymentMethod: string;
  amountPaid: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Validate gym ownership
  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("id", data.gym_id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!gym) throw new Error("Unauthorized");

  // Fetch plan details to calculate end date and verify price
  const { data: plan } = await supabase
    .from("plans")
    .select("id, duration_days, price")
    .eq("id", data.planId)
    .maybeSingle();
  if (!plan) throw new Error("Plan not found");

  const start = new Date(data.startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + plan.duration_days);
  const endDateStr = end.toISOString().split("T")[0];

  // Execute the RPC for atomic creation
  // @ts-expect-error: The create_membership_sale RPC is not yet in the generated Supabase types
  const { data: result, error } = await supabase.rpc("create_membership_sale", {
    p_gym_id: data.gym_id,
    p_full_name: data.full_name,
    p_phone: data.phone,
    p_email: data.email || "",
    p_photo_url: data.photoUrl || "",
    p_notes: data.notes || "",
    p_device_id: data.deviceEnrollmentId || "",
    p_plan_id: data.planId,
    p_start_date: data.startDate,
    p_end_date: endDateStr,
    p_plan_fee: plan.price,
    p_amount_paid: data.amountPaid,
    p_payment_method: data.paymentMethod,
  });

  if (error) {
    console.error("RPC Error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/members");
  return result;
}
