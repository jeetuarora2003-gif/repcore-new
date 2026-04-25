const { createClient } = require("@supabase/supabase-js");
const s = createClient(
  "https://vznttgjggsnndkkjiazp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bnR0Z2pnZ3NubmRra2ppYXpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzNjIxNSwiZXhwIjoyMDkyNTEyMjE1fQ.0JG8aLSkzMDAF0LBEolH9zEy6b6yugqGBvOyu3W5kG4"
);

(async () => {
  const gid = "5dfe7b80-875b-4778-9c2b-5eb36baa4a3f";

  // 1. Dashboard stats
  const { data: stats } = await s.rpc("get_dashboard_stats", { p_gym_id: gid });
  console.log("Dashboard stats:", JSON.stringify(stats, null, 2));

  // 2. View status breakdown
  const { data: view, error } = await s
    .from("v_member_status")
    .select("full_name,status,days_until_expiry,end_date")
    .eq("gym_id", gid)
    .order("days_until_expiry", { ascending: true });

  if (error) {
    console.log("View error:", error);
  } else {
    console.log("\nAll members by expiry:");
    for (const v of view) {
      console.log(
        v.full_name.padEnd(22) + " | " +
        (v.status || "").padEnd(14) + " | " +
        "expires: " + (v.end_date || "n/a").padEnd(12) + " | " +
        "days: " + v.days_until_expiry
      );
    }
  }
})();
