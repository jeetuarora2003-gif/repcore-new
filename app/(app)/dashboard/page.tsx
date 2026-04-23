import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: gym } = await supabase
    .from("gyms")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!gym) redirect("/register");

  const [
    { data: members },
    { data: recentCheckins },
    { data: expiringSoon },
  ] = await Promise.all([
    supabase.from("v_member_status").select("*").eq("gym_id", gym.id),
    supabase
      .from("attendance")
      .select("*, members(full_name)")
      .eq("gym_id", gym.id)
      .order("checked_in_at", { ascending: false })
      .limit(5),
    supabase
      .from("v_member_status")
      .select("*")
      .eq("gym_id", gym.id)
      .in("status", ["expiring_soon", "active"])
      .lte("days_until_expiry", 5)
      .gte("days_until_expiry", 0)
      .order("days_until_expiry", { ascending: true }),
  ]);

  const stats = {
    total: members?.length ?? 0,
    active: members?.filter(m => m.status === "active" || m.status === "expiring_soon").length ?? 0,
    expiring: members?.filter(m => (m.days_until_expiry ?? 99) <= 7 && (m.days_until_expiry ?? 99) >= 0).length ?? 0,
    dues: members?.reduce((sum, m) => sum + (m.balance_due ?? 0), 0) ?? 0,
  };

  return (
    <DashboardClient
      gym={gym}
      stats={stats}
      recentCheckins={recentCheckins ?? []}
      expiringSoon={expiringSoon ?? []}
    />
  );
}
