import { redirect } from "next/navigation";
import { startOfDayUtcIso } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/server";
import type { DashboardStats } from "@/lib/supabase/types";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: gym } = await supabase
    .from("gyms")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!gym) redirect("/register");

  const todayStart = startOfDayUtcIso(new Date());

  const [
    { data: statsData, error: statsError },
    { data: recentCheckins },
    { data: expiringSoon },
  ] = await Promise.all([
    supabase.rpc("get_dashboard_stats", { p_gym_id: gym.id }),
    supabase
      .from("attendance")
      .select("id, member_id, checked_in_at")
      .eq("gym_id", gym.id)
      .gte("checked_in_at", todayStart)
      .order("checked_in_at", { ascending: false })
      .limit(5),
    supabase
      .from("v_member_status")
      .select("*")
      .eq("gym_id", gym.id)
      .in("status", ["expiring_soon", "active"])
      .lte("days_until_expiry", 7)
      .gte("days_until_expiry", 0)
      .order("days_until_expiry", { ascending: true })
      .limit(10),
  ]);

  const recentCheckinMembers =
    recentCheckins && recentCheckins.length > 0
      ? await supabase
          .from("members")
          .select("id, full_name, photo_url")
          .in(
            "id",
            Array.from(new Set(recentCheckins.map((checkin) => checkin.member_id)))
          )
      : { data: [] as { id: string; full_name: string; photo_url: string }[] };

  const recentCheckinMemberMap = new Map(
    (recentCheckinMembers.data ?? []).map((member) => [member.id, member])
  );

  const hydratedRecentCheckins = (recentCheckins ?? []).map((checkin) => ({
    id: checkin.id,
    checked_in_at: checkin.checked_in_at,
    members: recentCheckinMemberMap.get(checkin.member_id) ?? null,
  }));

  if (statsError) {
    console.error("Dashboard stats error:", statsError);
  }

  const stats: DashboardStats = statsData ?? {
    total: 0,
    active: 0,
    expiring: 0,
    dues: 0,
    new_this_month: 0,
  };

  return (
    <DashboardClient
      gym={gym}
      stats={{
        total: stats.total ?? 0,
        active: stats.active ?? 0,
        expiring: stats.expiring ?? 0,
        dues: stats.dues ?? 0,
        newThisMonth: stats.new_this_month ?? 0,
      }}
      recentCheckins={hydratedRecentCheckins}
      expiringSoon={expiringSoon ?? []}
    />
  );
}
