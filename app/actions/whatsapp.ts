"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { encrypt } from "@/lib/crypto";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function updateReminderModeAction(gymId: string, mode: 'manual' | 'auto') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("gyms")
    // @ts-expect-error
    .update({ whatsapp_reminder_mode: mode })
    .eq("id", gymId)
    .eq("owner_id", user.id);

  if (error) throw error;
  
  revalidatePath("/settings/whatsapp");
}

export async function updateWhatsappConfigAction(gymId: string, data: { phone: string, apiKey: string, mode: 'auto' }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const encryptedKey = encrypt(data.apiKey);

  const { error } = await supabase
    .from("gyms")
    // @ts-expect-error
    .update({ 
      whatsapp_phone_number: data.phone,
      whatsapp_api_key: encryptedKey,
      whatsapp_reminder_mode: data.mode
    })
    .eq("id", gymId)
    .eq("owner_id", user.id);

  if (error) throw error;
  
  revalidatePath("/settings/whatsapp");
}

export async function createRazorpayOrder(amountPaise: number) {
  const options = {
    amount: amountPaise,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return { success: true, order };
  } catch (err) {
    return { success: false, error: (err as any).message };
  }
}

export async function addCreditsAction(gymId: string, amountPaise: number, paymentData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Verify Signature
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new Error("Invalid payment signature");
  }

  // 1. Update/Upsert credits balance
  // We use a transaction or RPC to be safe
  // @ts-expect-error
  const { error: upsertErr } = await supabase.rpc("add_whatsapp_credits", {
    p_gym_id: gymId,
    p_amount: amountPaise,
    p_order_id: razorpay_order_id,
    p_payment_id: razorpay_payment_id,
    p_description: "Credits Top-up"
  });

  if (upsertErr) throw upsertErr;

  revalidatePath("/settings/whatsapp");
  return { success: true };
}
