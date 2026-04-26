import { cache } from "react";
import { createClient } from "./server";

export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getCachedGym = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: gym } = await supabase
    .from("gyms")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();
  return gym;
});
