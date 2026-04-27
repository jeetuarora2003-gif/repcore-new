"use server";

import { z } from "zod";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { toDateKey } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/server";
import type { MembershipSaleResult } from "@/lib/supabase/types";
import { createMemberSchema, membershipSaleSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

const toggleFreezeSchema = z.object({
  memberId: z.string().uuid("Invalid member."),
});

export async function createMember(data: {
  gym_id: string;
  full_name: string;
  phone: string;
  email: string;
  joining_date: string;
  notes: string;
}) {
  const parsed = createMemberSchema.parse(data);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("id", parsed.gym_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!gym) throw new Error("Unauthorized");

  const { data: member, error } = await supabase
    .from("members")
    .insert(parsed)
    .select()
    .single();

  if (error) throw new Error(getFriendlyErrorMessage(error));

  revalidatePath("/members");
  return member;
}

export async function toggleFreeze(memberId: string) {
  const parsed = toggleFreezeSchema.parse({ memberId });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: member } = await supabase
    .from("members")
    .select("id, is_frozen, gym_id")
    .eq("id", parsed.memberId)
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
      frozen_since: nowFrozen ? toDateKey(new Date()) : null,
    })
    .eq("id", parsed.memberId);

  if (error) throw new Error(getFriendlyErrorMessage(error));

  revalidatePath(`/members/${parsed.memberId}`);
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
  paymentMethod: "cash" | "upi" | "card" | "bank_transfer";
  amountPaid: number;
}) {
  try {
    const parsed = membershipSaleSchema.parse(data);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // 1. Authorization check
    const { data: gym } = await supabase
      .from("gyms")
      .select("id")
      .eq("id", parsed.gym_id)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!gym) throw new Error("Unauthorized access to this gym.");

    // 2. Pre-check for duplicate phone number to give a clear error
    const { data: existingMember } = await supabase
      .from("members")
      .select("id")
      .eq("gym_id", parsed.gym_id)
      .eq("phone", parsed.phone)
      .maybeSingle();

    if (existingMember) {
      throw new Error("A member with this phone number already exists in your gym.");
    }

    // 3. Get plan details
    const { data: plan } = await supabase
      .from("plans")
      .select("id, duration_days, price")
      .eq("id", parsed.planId)
      .eq("gym_id", parsed.gym_id)
      .maybeSingle();

    if (!plan) throw new Error("The selected plan could not be found.");

    // 4. Calculate dates
    let endDateStr: string;
    try {
      const start = new Date(`${parsed.startDate}T00:00:00+05:30`);
      if (isNaN(start.getTime())) throw new Error();
      
      const end = new Date(start);
      end.setDate(end.getDate() + plan.duration_days);
      endDateStr = toDateKey(end);
    } catch (e) {
      throw new Error("Invalid start date provided.");
    }

    // 5. Atomic RPC call
    const { data: result, error } = await supabase.rpc("create_membership_sale", {
      p_gym_id: parsed.gym_id,
      p_full_name: parsed.full_name,
      p_phone: parsed.phone,
      p_email: parsed.email,
      p_photo_url: parsed.photoUrl,
      p_notes: parsed.notes,
      p_device_id: parsed.deviceEnrollmentId,
      p_plan_id: parsed.planId,
      p_start_date: parsed.startDate,
      p_end_date: endDateStr,
      p_plan_fee: plan.price,
      p_amount_paid: parsed.amountPaid,
      p_payment_method: parsed.paymentMethod,
    });

    if (error) throw new Error(getFriendlyErrorMessage(error));

    // 6. Revalidate
    revalidatePath("/members");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return result as MembershipSaleResult;
  } catch (error) {
    console.error("Membership sale error:", error);
    // Ensure we always return a friendly error message that can be caught by the UI
    throw new Error(getFriendlyErrorMessage(error));
  }
}
