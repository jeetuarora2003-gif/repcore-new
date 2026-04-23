"use server";

import { createClient } from "@/lib/supabase/server";
import { generateNumber } from "@/lib/helpers";
import { revalidatePath } from "next/cache";

export async function addSubscription(
  memberId: string,
  planId: string,
  startDate: string,
  gymId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: gym } = await supabase
    .from("gyms")
    .select("id, invoice_prefix")
    .eq("id", gymId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!gym) throw new Error("Unauthorized");

  const { data: plan } = await supabase
    .from("plans")
    .select("id, duration_days, price")
    .eq("id", planId)
    .maybeSingle();
  if (!plan) throw new Error("Plan not found");

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + plan.duration_days);
  const endDate = end.toISOString().split("T")[0];

  const { data: sub, error: subErr } = await supabase
    .from("subscriptions")
    .insert({ gym_id: gymId, member_id: memberId, plan_id: planId, start_date: startDate, end_date: endDate })
    .select()
    .single();
  if (subErr) throw subErr;

  // Generate invoice number
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("gym_id", gymId);
  const seq = (count ?? 0) + 1;
  const invoiceNumber = generateNumber(gym.invoice_prefix, year, seq);

  const { error: invErr } = await supabase
    .from("invoices")
    .insert({
      gym_id: gymId,
      member_id: memberId,
      subscription_id: sub.id,
      invoice_number: invoiceNumber,
      amount: plan.price,
    });
  if (invErr) throw invErr;

  revalidatePath(`/members/${memberId}`);
  return sub;
}

export async function recordPayment(data: {
  gym_id: string;
  member_id: string;
  invoice_id?: string;
  amount: number;
  payment_method: string;
  notes: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: gym } = await supabase
    .from("gyms")
    .select("id, receipt_prefix")
    .eq("id", data.gym_id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!gym) throw new Error("Unauthorized");

  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("gym_id", data.gym_id);
  const seq = (count ?? 0) + 1;
  const receiptNumber = generateNumber(gym.receipt_prefix, year, seq);

  const { error } = await supabase
    .from("payments")
    .insert({ ...data, receipt_number: receiptNumber });
  if (error) throw error;

  revalidatePath(`/members/${data.member_id}`);
  revalidatePath("/reports");
}
