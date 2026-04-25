"use server";

import { getFriendlyErrorMessage } from "@/lib/errors";
import { toDateKey } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/server";
import type { PaymentReceiptResult, SubscriptionSaleResult } from "@/lib/supabase/types";
import { paymentSchema, subscriptionSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function addSubscription(
  memberId: string,
  planId: string,
  startDate: string,
  gymId: string
) {
  const parsed = subscriptionSchema.parse({ memberId, planId, startDate, gymId });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("id", parsed.gymId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!gym) throw new Error("Unauthorized");

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("id", parsed.memberId)
    .eq("gym_id", parsed.gymId)
    .maybeSingle();

  if (!member) throw new Error("Member not found");

  const { data: plan } = await supabase
    .from("plans")
    .select("id, duration_days, price")
    .eq("id", parsed.planId)
    .eq("gym_id", parsed.gymId)
    .maybeSingle();

  if (!plan) throw new Error("Plan not found");

  const start = new Date(`${parsed.startDate}T00:00:00+05:30`);
  const end = new Date(start);
  end.setDate(end.getDate() + plan.duration_days);
  const endDate = toDateKey(end);

  const { data: result, error } = await supabase.rpc("add_subscription_with_invoice", {
    p_gym_id: parsed.gymId,
    p_member_id: parsed.memberId,
    p_plan_id: parsed.planId,
    p_start_date: parsed.startDate,
    p_end_date: endDate,
    p_plan_price: plan.price,
  });

  if (error) throw new Error(getFriendlyErrorMessage(error));

  revalidatePath(`/members/${parsed.memberId}`);
  revalidatePath("/members");
  revalidatePath("/dues");
  revalidatePath("/reports");
  revalidatePath("/reminders");

  return result as SubscriptionSaleResult;
}

export async function recordPayment(data: {
  gym_id: string;
  member_id: string;
  invoice_id?: string;
  amount: number;
  payment_method: "cash" | "upi" | "card" | "bank_transfer";
  notes: string;
}) {
  const parsed = paymentSchema.parse(data);
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

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("id", parsed.member_id)
    .eq("gym_id", parsed.gym_id)
    .maybeSingle();

  if (!member) throw new Error("Member not found");

  if (parsed.invoice_id) {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("id")
      .eq("id", parsed.invoice_id)
      .eq("gym_id", parsed.gym_id)
      .maybeSingle();

    if (!invoice) throw new Error("Invoice not found");
  }

  const { data: result, error } = await supabase.rpc("record_payment_with_receipt", {
    p_gym_id: parsed.gym_id,
    p_member_id: parsed.member_id,
    p_invoice_id: parsed.invoice_id ?? null,
    p_amount: parsed.amount,
    p_payment_method: parsed.payment_method,
    p_notes: parsed.notes,
  });

  if (error) throw new Error(getFriendlyErrorMessage(error));

  revalidatePath(`/members/${parsed.member_id}`);
  revalidatePath("/reports");
  revalidatePath("/dues");
  revalidatePath("/dashboard");

  return result as PaymentReceiptResult;
}
