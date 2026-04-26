import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedGym } from "@/lib/supabase/cached-queries";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCachedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gym = await getCachedGym(user.id);
  if (!gym) return NextResponse.json({ error: "Gym not found" }, { status: 404 });

  const supabase = await createClient();

  const [
    { data: member },
    { data: invoices },
    { data: payments },
    { data: attendance },
    { data: plans },
  ] = await Promise.all([
    supabase.from("v_member_status").select("*").eq("id", id).eq("gym_id", gym.id).maybeSingle(),
    supabase.from("invoices").select("*").eq("member_id", id).order("created_at", { ascending: false }),
    supabase.from("payments").select("*").eq("member_id", id).order("paid_at", { ascending: false }),
    supabase.from("attendance").select("*").eq("member_id", id).order("checked_in_at", { ascending: false }).limit(60),
    supabase.from("plans").select("*").eq("gym_id", gym.id).eq("is_active", true),
  ]);

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  return NextResponse.json({
    member,
    invoices: invoices ?? [],
    payments: payments ?? [],
    attendance: attendance ?? [],
    plans: plans ?? [],
  });
}
