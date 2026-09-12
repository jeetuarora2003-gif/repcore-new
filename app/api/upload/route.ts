import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCachedUser, getCachedGym } from "@/lib/supabase/cached-queries";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "member-photos";

export async function POST(request: Request) {
  try {
    const user = await getCachedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gym = await getCachedGym(user.id);
    if (!gym) {
      return NextResponse.json({ error: "Gym not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || !(image instanceof Blob)) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const path = `${gym.id}/${randomUUID()}.jpg`;
    const supabase = createAdminClient();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, image, { contentType: "image/jpeg", upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Server upload failed" }, { status: 500 });
  }
}
