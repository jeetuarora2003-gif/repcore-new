import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WhatsappSettingsClient from "./WhatsappSettingsClient";

export default async function WhatsappSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: gym } = await supabase
    .from("gyms")
    .select(`
      *,
      whatsapp_credits ( balance_paise )
    `)
    .eq("owner_id", user.id)
    .single();

  if (!gym) redirect("/register");

  const { data: transactions } = await supabase
    .from("whatsapp_credit_transactions")
    .select("*")
    .eq("gym_id", gym.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const balancePaise = gym.whatsapp_credits?.[0]?.balance_paise || 0;

  return (
    <WhatsappSettingsClient 
      gym={gym} 
      balancePaise={balancePaise} 
      transactions={transactions ?? []} 
    />
  );
}
