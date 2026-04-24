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

  // We DO NOT await these here. We pass the promises to the client to enable streaming.
  const statsPromise = Promise.resolve(supabase
    .rpc("get_dashboard_stats", { p_gym_id: gym.id })
    .then((res) => {
      if (res.error) console.error("Dashboard stats error:", res.error);
      return (res.data as any) ?? { total: 0, active: 0, expiring: 0, dues: 0, new_this_month: 0, today_revenue: 0 };
    })
    .then((stats) => ({
      total: stats.total ?? 0,
      active: stats.active ?? 0,
      expiring: stats.expiring ?? 0,
      dues: stats.dues ?? 0,
      newThisMonth: stats.new_this_month ?? 0,
      todayRevenue: stats.today_revenue ?? 0,
    })));

  const recentCheckinsPromise = Promise.resolve(supabase
    .from("attendance")
    .select("id, member_id, checked_in_at")
    .eq("gym_id", gym.id)
    .gte("checked_in_at", todayStart)
    .order("checked_in_at", { ascending: false })
    .limit(5)
    .then(async ({ data: recentCheckins }) => {
      if (!recentCheckins || recentCheckins.length === 0) return [];

      const { data: members } = await supabase
        .from("members")
        .select("id, full_name, photo_url")
        .in(
          "id",
          Array.from(new Set(recentCheckins.map((c) => c.member_id)))
        );

      const memberMap = new Map((members ?? []).map((m) => [m.id, m]));
      return recentCheckins.map((checkin) => ({
        id: checkin.id,
        checked_in_at: checkin.checked_in_at,
        members: memberMap.get(checkin.member_id) ?? null,
      }));
    }));

  const expiringSoonPromise = Promise.resolve(supabase
    .from("v_member_status")
    .select("*")
    .eq("gym_id", gym.id)
    .in("status", ["expiring_soon", "active"])
    .lte("days_until_expiry", 7)
    .gte("days_until_expiry", 0)
    .order("days_until_expiry", { ascending: true })
    .limit(10)
    .then((res) => res.data ?? []));

  return (
    <DashboardClient
      gym={gym}
      statsPromise={statsPromise}
      recentCheckinsPromise={recentCheckinsPromise}
      expiringSoonPromise={expiringSoonPromise}
    />
  );
}
