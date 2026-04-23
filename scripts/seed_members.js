import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GYM_ID = "5dfe7b80-875b-4778-9c2b-5eb36baa4a3f";
const PLAN_ID = "19ce51fa-de5c-4085-944f-4287ec49f84c";
const PLAN_PRICE = 1500;

const firstNames = ["Amit", "Rahul", "Sanjay", "Vikram", "Anjali", "Priya", "Neha", "Deepak", "Karan", "Sonia", "Rohan", "Simran", "Ishaan", "Aarav", "Kiara"];
const lastNames = ["Sharma", "Verma", "Gupta", "Singh", "Patel", "Malhotra", "Johar", "Kapoor", "Reddy", "Chopra", "Khan", "Das", "Joshi", "Mehta", "Nair"];

async function seed() {
  console.log(`Starting seed of 90 members for gym ${GYM_ID}...`);

  for (let index = 1; index <= 90; index += 1) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName} ${index}`;

    const daysAgo = Math.floor((index - 1) / 3);
    const joiningDate = new Date();
    joiningDate.setDate(joiningDate.getDate() - daysAgo);
    const dateStr = joiningDate.toISOString().split("T")[0];

    try {
      const { data: member, error: memberError } = await supabase
        .from("members")
        .insert({
          gym_id: GYM_ID,
          full_name: fullName,
          phone: `999${index.toString().padStart(7, "0")}`,
          email: `${firstName.toLowerCase()}${index}@test.com`,
          joining_date: dateStr,
          notes: "Automated test member",
        })
        .select()
        .single();

      if (memberError) throw memberError;

      const endDate = new Date(joiningDate);
      endDate.setDate(endDate.getDate() + 30);
      const { data: subscription, error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          gym_id: GYM_ID,
          member_id: member.id,
          plan_id: PLAN_ID,
          start_date: dateStr,
          end_date: endDate.toISOString().split("T")[0],
        })
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          gym_id: GYM_ID,
          member_id: member.id,
          subscription_id: subscription.id,
          invoice_number: `TST-INV-${index.toString().padStart(4, "0")}`,
          amount: PLAN_PRICE,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const { error: paymentError } = await supabase.from("payments").insert({
        gym_id: GYM_ID,
        member_id: member.id,
        invoice_id: invoice.id,
        receipt_number: `TST-REC-${index.toString().padStart(4, "0")}`,
        amount: PLAN_PRICE,
        payment_method: "upi",
        paid_at: new Date().toISOString(),
      });

      if (paymentError) throw paymentError;

      if (index % 10 === 0) {
        console.log(`Seeded ${index}/90 members...`);
      }
    } catch (error) {
      console.error(`Error at member ${index}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log("Seeding complete!");
}

void seed();
