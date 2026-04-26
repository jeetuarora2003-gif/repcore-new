"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g., max 5MB for ImgBB free tier)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Max size is 5MB.");
      return;
    }

    try {
      setIsUploading(true);

      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!apiKey) {
        throw new Error("ImgBB API key is missing. Please add NEXT_PUBLIC_IMGBB_API_KEY to your .env.local file.");
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to upload image to ImgBB");
      }

      // ImgBB returns the direct image URL in data.data.url
      onChange(data.data.url);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "relative flex items-center justify-center border-2 border-dashed rounded-full overflow-hidden bg-muted/50 cursor-pointer transition-colors hover:bg-muted shrink-0",
          "w-24 h-24", // Adjust size as needed
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded photo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : isUploading ? (
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <Camera className="w-8 h-8 mb-1 opacity-50" />
            <span className="text-[10px] uppercase font-medium tracking-wider">Photo</span>
          </div>
        )}
      </div>
    </div>
  );
}
