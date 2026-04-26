import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedGym } from "@/lib/supabase/cached-queries";
import { startOfDayUtcIso } from "@/lib/helpers";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCachedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gym = await getCachedGym(user.id);
  if (!gym) return NextResponse.json({ error: "Gym not found" }, { status: 404 });

  const supabase = await createClient();
  const todayStart = startOfDayUtcIso(new Date());

  const [
    { data: statsData },
    { data: recentCheckins },
    { data: expiringSoon }
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
      .select("id, full_name, photo_url, days_until_expiry")
      .eq("gym_id", gym.id)
      .in("status", ["expiring_soon", "active"])
      .lte("days_until_expiry", 7)
      .gte("days_until_expiry", 0)
      .order("days_until_expiry", { ascending: true })
      .limit(10)
  ]);

  // Resolve members for check-ins
  let resolvedCheckins = [];
  if (recentCheckins && recentCheckins.length > 0) {
    const { data: members } = await supabase
      .from("members")
      .select("id, full_name, photo_url")
      .in("id", recentCheckins.map(c => c.member_id));
    
    const memberMap = new Map((members ?? []).map(m => [m.id, m]));
    resolvedCheckins = recentCheckins.map(c => ({
      ...c,
      members: memberMap.get(c.member_id) ?? null
    }));
  }

  const stats = (statsData as any) ?? { total: 0, active: 0, expiring: 0, dues: 0, new_this_month: 0, today_revenue: 0 };

  return NextResponse.json({
    stats: {
      total: stats.total ?? 0,
      active: stats.active ?? 0,
      expiring: stats.expiring ?? 0,
      dues: stats.dues ?? 0,
      newThisMonth: stats.new_this_month ?? 0,
      todayRevenue: stats.today_revenue ?? 0,
    },
    recentCheckins: resolvedCheckins,
    expiringSoon: expiringSoon ?? []
  });
}
