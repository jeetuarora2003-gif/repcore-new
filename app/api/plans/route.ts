import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedGym } from "@/lib/supabase/cached-queries";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCachedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gym = await getCachedGym(user.id);
  if (!gym) return NextResponse.json({ error: "Gym not found" }, { status: 404 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("gym_id", gym.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
