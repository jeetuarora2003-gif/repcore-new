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

  // Parallelize the statistics and list fetches
  const [
    { data: statsData, error: statsError },
    { data: recentCheckins },
    { data: expiringSoon },
  ] = await Promise.all([
    // High-performance RPC for counts and totals
    supabase.rpc('get_dashboard_stats', { p_gym_id: gym.id }),
    
    // Targeted lists
    supabase
      .from("attendance")
      .select("*, members(full_name)")
      .eq("gym_id", gym.id)
      .order("checked_in_at", { ascending: false })
      .limit(5),
      
    supabase
      .from("v_member_status")
      .select("id, full_name, phone, plan_name, days_until_expiry, status")
      .eq("gym_id", gym.id)
      .in("status", ["expiring_soon", "active"])
      .lte("days_until_expiry", 7)
      .gte("days_until_expiry", 0)
      .order("days_until_expiry", { ascending: true })
      .limit(10), // Limit dashboard view to top 10
  ]);

  if (statsError) {
    console.error("Dashboard stats error:", statsError);
  }

  // Map the RPC response to the existing stats interface
  const stats = {
    total: statsData?.total ?? 0,
    active: statsData?.active ?? 0,
    expiring: statsData?.expiring ?? 0,
    dues: statsData?.dues ?? 0,
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
