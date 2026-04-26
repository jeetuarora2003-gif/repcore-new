"use server";

import { z } from "zod";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const attendanceSchema = z.object({
  memberId: z.string().uuid("Invalid member."),
  gymId: z.string().uuid("Invalid gym."),
});

export async function checkIn(memberId: string, gymId: string) {
  const parsed = attendanceSchema.parse({ memberId, gymId });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: gym } = await supabase
    .from("gyms")
    .select("id")
    .eq("id", parsed.gymId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!gym) throw new Error("Unauthorized");

  const { data: record, error } = await supabase
    .from("attendance")
    .insert({ gym_id: parsed.gymId, member_id: parsed.memberId })
    .select()
    .single();

  if (error) throw new Error(getFriendlyErrorMessage(error));

  // Only revalidate the necessary path, SWR handles the rest on the client
  revalidatePath(`/members/${parsed.memberId}`);

  return record;
}
