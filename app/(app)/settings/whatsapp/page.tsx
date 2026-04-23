import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WhatsappSettingsClient from "./WhatsappSettingsClient";

export default async function WhatsappSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: gym } = await supabase
    .from("gyms")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!gym) redirect("/register");

  return (
    <WhatsappSettingsClient gym={gym} />
  );
}
