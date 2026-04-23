import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayoutClient from "./AppLayoutClient";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: gym } = await supabase
    .from("gyms")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!gym) redirect("/register");

  return <AppLayoutClient gym={gym}>{children}</AppLayoutClient>;
}
