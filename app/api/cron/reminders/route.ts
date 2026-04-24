import { NextRequest, NextResponse } from "next/server";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { sendAutoRemindersForAllGyms } from "@/lib/actions/whatsapp-auto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new Error("CRON_SECRET must be configured for reminder cron jobs.");
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // 1. Clean up old attendance records (older than 6 months) to save space
    const supabase = createAdminClient();
    await supabase.rpc("clean_old_attendance");

    // 2. Process auto-reminders
    const results = await sendAutoRemindersForAllGyms();
    const summary = results.reduce(
      (acc, result) => {
        acc.sent += result.sent;
        acc.failed += result.failed;
        return acc;
      },
      { sent: 0, failed: 0 }
    );

    return NextResponse.json({
      ok: true,
      processedGyms: results.length,
      sent: summary.sent,
      failed: summary.failed,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: getFriendlyErrorMessage(error) },
      { status: 500 }
    );
  }
}
