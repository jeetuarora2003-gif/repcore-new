import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Try different possible environment variable names
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || process.env.IMGBB_API_KEY; 
    
    if (!apiKey) {
      console.error("ImgBB Key missing. ENV keys available:", Object.keys(process.env).filter(k => k.includes("IMGBB")));
      return NextResponse.json({ 
        error: "ImgBB API key is not configured on the server. Please check Vercel Settings." 
      }, { status: 500 });
    }

    const imgbbFormData = new FormData();
    imgbbFormData.append("image", image);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: imgbbFormData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json({ error: data.error?.message || "ImgBB upload failed" }, { status: response.status });
    }

    return NextResponse.json(data.data);
  } catch (error: any) {
    console.error("Proxy upload error:", error);
    return NextResponse.json({ error: error.message || "Server upload failed" }, { status: 500 });
  }
}
