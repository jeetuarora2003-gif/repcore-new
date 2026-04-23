import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!gym) redirect("/register");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { data: allPayments },
    { data: monthPayments },
    { data: monthMembers },
    { data: dues },
    { data: memberStatuses },
  ] = await Promise.all([
    supabase.from("payments").select("*").eq("gym_id", gym.id).order("paid_at", { ascending: false }),
    supabase.from("payments").select("*").eq("gym_id", gym.id).gte("paid_at", startOfMonth),
    supabase.from("members").select("id").eq("gym_id", gym.id).gte("created_at", startOfMonth),
    supabase.from("v_member_status").select("balance_due").eq("gym_id", gym.id).gt("balance_due", 0),
    supabase.from("v_member_status").select("status").eq("gym_id", gym.id),
  ]);

  // Build 6-month revenue data
  const monthlyRevenue: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.toISOString();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
    const monthPaymentsForPeriod = allPayments?.filter(p => p.paid_at >= start && p.paid_at <= end) ?? [];
    const total = monthPaymentsForPeriod.reduce((s, p) => s + (p.amount ?? 0), 0);
    monthlyRevenue.push({
      month: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      amount: total,
    });
  }

  // Payment method breakdown
  const methods = ["cash", "upi", "card", "bank_transfer"] as const;
  const methodBreakdown = methods.map(m => ({
    method: m,
    count: allPayments?.filter(p => p.payment_method === m).length ?? 0,
    amount: allPayments?.filter(p => p.payment_method === m).reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0,
  }));

  // Member status breakdown
  const statusCounts: Record<string, number> = {
    active: 0,
    expiring_soon: 0,
    expired: 0,
    lapsed: 0,
    frozen: 0,
    no_plan: 0,
  };
  memberStatuses?.forEach(m => {
    const s = m.status as string;
    if (s in statusCounts) statusCounts[s]++;
  });

  return (
    <ReportsClient
      monthRevenue={monthPayments?.reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0}
      newMembersCount={monthMembers?.length ?? 0}
      totalDues={dues?.reduce((s, d) => s + (d.balance_due ?? 0), 0) ?? 0}
      monthlyRevenue={monthlyRevenue}
      methodBreakdown={methodBreakdown}
      statusBreakdown={statusCounts}
    />
  );
}
