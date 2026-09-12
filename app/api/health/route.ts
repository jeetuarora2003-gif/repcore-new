import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CRON_SECRET",
  "ENCRYPTION_KEY",
] as const;

// Point an external uptime monitor (UptimeRobot, cron-job.org, etc.) at this
// endpoint every few hours. That single ping does two jobs at once: it keeps
// Supabase's free-tier project from auto-pausing after 7 days of no API
// activity, and it lets the monitor email an alert the moment this route
// stops returning 200 — instead of nobody noticing for weeks.
export async function GET() {
  const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (missingEnvVars.length > 0) {
    return NextResponse.json(
      { ok: false, error: "Missing required environment variables", missingEnvVars },
      { status: 500 }
    );
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("gyms").select("id").limit(1);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
