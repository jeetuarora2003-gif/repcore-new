import { redirect } from "next/navigation";
import { getCachedUser, getCachedGym } from "@/lib/supabase/cached-queries";
import AppLayoutClient from "./AppLayoutClient";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCachedUser();
  if (!user) redirect("/login");

  const gym = await getCachedGym(user.id);
  if (!gym) redirect("/register");

  return <AppLayoutClient gym={gym}>{children}</AppLayoutClient>;
}
