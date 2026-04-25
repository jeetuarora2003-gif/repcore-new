const { createClient } = require("@supabase/supabase-js");

const s = createClient(
  "https://vznttgjggsnndkkjiazp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bnR0Z2pnZ3NubmRra2ppYXpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzNjIxNSwiZXhwIjoyMDkyNTEyMjE1fQ.0JG8aLSkzMDAF0LBEolH9zEy6b6yugqGBvOyu3W5kG4"
);

const GYM_ID = "5dfe7b80-875b-4778-9c2b-5eb36baa4a3f";

const plans = [
  { id: "19ce51fa-de5c-4085-944f-4287ec49f84c", name: "Monthly",   days: 30,  price: 1500 },
  { id: "51b0de6f-3514-4cfc-8902-1acf33b67516", name: "Quarterly", days: 90,  price: 4000 },
  { id: "c1e3afff-e741-42fc-84a7-da3a3ecd86a8", name: "Platinum",  days: 180, price: 8000 },
];

const names = [
  "Aarav Sharma",    "Vivaan Patel",     "Aditya Singh",    "Vihaan Gupta",
  "Arjun Mehta",     "Sai Kumar",        "Reyansh Joshi",   "Ayaan Verma",
  "Krishna Reddy",   "Ishaan Nair",      "Shaurya Rao",     "Atharv Desai",
  "Advik Chauhan",   "Pranav Mishra",    "Advait Saxena",   "Dhruv Kapoor",
  "Kabir Malhotra",  "Ritvik Bhatia",    "Aarush Thakur",   "Darsh Iyer",
  "Yash Pandey",     "Harsh Tiwari",     "Rohan Choudhary", "Kunal Agarwal",
  "Nikhil Bansal",   "Tanish Dutta",     "Arnav Sethi",     "Laksh Khurana",
  "Parth Srivastava","Rudra Bhardwaj",
];

const phones = names.map((_, i) => `9${String(8000000000 + i * 111111).slice(0, 9)}`);

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

(async () => {
  const today = new Date();
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < 30; i++) {
    const daysAgo = 30 - i; // day 1 = 30 days ago, day 30 = today
    const joinDate = new Date(today);
    joinDate.setDate(joinDate.getDate() - daysAgo);
    const joinStr = joinDate.toISOString().split("T")[0];
    const joinTs  = joinDate.toISOString();

    const plan = plans[i % plans.length]; // rotate through plans
    const endDate = addDays(joinStr, plan.days);

    // 1. Insert member
    const { data: member, error: e1 } = await s
      .from("members")
      .insert({
        gym_id: GYM_ID,
        full_name: names[i],
        phone: phones[i],
        email: `${names[i].toLowerCase().replace(/\s/g, ".")}@example.com`,
        joining_date: joinStr,
        created_at: joinTs,
      })
      .select("id")
      .single();

    if (e1) { console.error(`Member ${names[i]} failed:`, e1.message); fail++; continue; }

    // 2. Insert subscription
    const { data: sub, error: e2 } = await s
      .from("subscriptions")
      .insert({
        gym_id: GYM_ID,
        member_id: member.id,
        plan_id: plan.id,
        start_date: joinStr,
        end_date: endDate,
        created_at: joinTs,
      })
      .select("id")
      .single();

    if (e2) { console.error(`Sub for ${names[i]} failed:`, e2.message); fail++; continue; }

    // 3. Insert invoice
    const invNum = `INV-${String(1000 + i)}`;
    const { data: inv, error: e3 } = await s
      .from("invoices")
      .insert({
        gym_id: GYM_ID,
        member_id: member.id,
        subscription_id: sub.id,
        invoice_number: invNum,
        amount: plan.price,
        created_at: joinTs,
      })
      .select("id")
      .single();

    if (e3) { console.error(`Invoice for ${names[i]} failed:`, e3.message); fail++; continue; }

    // 4. Insert payment (fully paid)
    const rcptNum = `RCP-${String(1000 + i)}`;
    const { error: e4 } = await s
      .from("payments")
      .insert({
        gym_id: GYM_ID,
        member_id: member.id,
        invoice_id: inv.id,
        receipt_number: rcptNum,
        amount: plan.price,
        payment_method: "cash",
        notes: "",
        paid_at: joinTs,
      });

    if (e4) { console.error(`Payment for ${names[i]} failed:`, e4.message); fail++; continue; }

    ok++;
    console.log(`✓ ${names[i]} — ${plan.name} (₹${plan.price}) — joined ${joinStr}`);
  }

  console.log(`\nDone: ${ok} succeeded, ${fail} failed`);
})();
