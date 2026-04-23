"use server";

import { getFriendlyErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { planSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function createPlan(data: {
  gym_id: string;
  name: string;
  duration_days: number;
  price: number;
}) {
  const parsed = planSchema.parse(data);
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

  const { error } = await supabase.from("plans").insert(parsed);
  if (error) throw new Error(getFriendlyErrorMessage(error));

  revalidatePath("/plans");
}

export async function togglePlanActive(planId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: plan } = await supabase
    .from("plans")
    .select("id, is_active, gym_id")
    .eq("id", planId)
    .maybeSingle();

  if (!plan) throw new Error("Plan not found");

  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("id", plan.gym_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!gym) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("plans")
    .update({ is_active: !plan.is_active })
    .eq("id", planId);

  if (error) throw new Error(getFriendlyErrorMessage(error));

  revalidatePath("/plans");
}
