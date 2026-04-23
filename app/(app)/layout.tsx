import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

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

  return <AppShell gym={gym}>{children}</AppShell>;
}
