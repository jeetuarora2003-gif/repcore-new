import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { formatDate } from "@/lib/helpers";

export async function sendAutoRemindersForGym(gymId: string) {
  const supabase = await createClient();

  // 1. Fetch Gym Config & Credits
  // @ts-expect-error: whatsapp_reminder_mode is newly added and not yet in generated types
  const { data: gym, error: gymErr } = await supabase
    .from("gyms")
    .select(`
      id, name, phone, whatsapp_reminder_mode, whatsapp_phone_number, whatsapp_api_key,
      whatsapp_credits ( balance_paise )
    `)
    .eq("id", gymId)
    .single();

  if (gymErr || !gym) return { success: false, error: "Gym not found" };

  // 2. Pre-checks
  // @ts-expect-error
  if (gym.whatsapp_reminder_mode !== "auto") return { skipped: true, reason: "Manual mode" };
  
  const balance = gym.whatsapp_credits?.[0]?.balance_paise || 0;
  if (balance < 15) {
    console.warn(`[AutoReminder] Low balance for gym ${gym.name}: ${balance} paise`);
    return { success: false, error: "Low balance", balance };
  }

  const apiKey = decrypt(gym.whatsapp_api_key || "");
  if (!apiKey || !gym.whatsapp_phone_number) {
    return { success: false, error: "WhatsApp API not configured" };
  }

  // 3. Fetch members in 5, 3, 1 stage
  // We use the same view as the reminders page for consistency
  const { data: members, error: memErr } = await supabase
    .from("v_member_status")
    .select("*")
    .eq("gym_id", gymId)
    .gt("balance_due", 0); // Only send if balance > 0

  if (memErr) return { success: false, error: memErr.message };

  let sentCount = 0;
  let failedCount = 0;

  const today = new Date();
  
  for (const m of members) {
    const endDate = new Date(m.end_date);
    const diffTime = endDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let stage: 5 | 3 | 1 | null = null;
    let sentAtField: "reminder_5_sent_at" | "reminder_3_sent_at" | "reminder_1_sent_at" | null = null;

    if (daysRemaining === 5 && !m.reminder_5_sent_at) { stage = 5; sentAtField = "reminder_5_sent_at"; }
    else if (daysRemaining === 3 && !m.reminder_3_sent_at) { stage = 3; sentAtField = "reminder_3_sent_at"; }
    else if (daysRemaining === 1 && !m.reminder_1_sent_at) { stage = 1; sentAtField = "reminder_1_sent_at"; }

    if (stage && sentAtField) {
      // Build message
      const message = `Hi ${m.full_name}! 🏋️ Your ${m.plan_name || "membership"} at ${gym.name} expires on ${formatDate(m.end_date)}. Renew now to continue your fitness journey! Call/WhatsApp us: ${gym.phone}`;

      try {
        // Post to AiSensy API (v2)
        const response = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-AiSensy-Project-API-PWD": apiKey 
          },
          body: JSON.stringify({
            apiKey: apiKey,
            campaignName: `repcore_reminder_${stage}`,
            destination: m.phone.replace(/\D/g, ""),
            userName: gym.name,
            templateParams: [m.full_name, gym.name, formatDate(m.end_date), String(stage)]
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Success: Stamp, Deduct, Log
          await supabase.from("subscriptions").update({ [sentAtField]: new Date().toISOString() }).eq("id", m.subscription_id);
          
          // Deduct 15 paise
          await supabase.rpc("deduct_whatsapp_credits", { 
            p_gym_id: gymId, 
            p_amount: 15,
            p_description: `Reminder sent · ${m.full_name}`,
            p_member_id: m.id
          });

          sentCount++;
        } else {
          console.error(`[AiSensy API Error] ${JSON.stringify(result)}`);
          failedCount++;
        }
      } catch (err) {
        console.error(`[AutoReminder Fetch Error]`, err);
        failedCount++;
      }
    }
  }

  return { sent: sentCount, failed: failedCount };
}
