"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

const MAX_DIMENSION = 400;
const JPEG_QUALITY = 0.8;

// Member photos only ever render at up to 96px in this app. A phone camera
// photo can be 3-5MB at full resolution, so we downscale + recompress to a
// JPEG capped at MAX_DIMENSION before upload - this cuts typical file size
// by 100x+, which matters a lot against a storage service's free-tier quota.
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not process image"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Could not process image"))),
        "image/jpeg",
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image"));
    };

    img.src = objectUrl;
  });
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Sanity cap on the original file before we even try to decode it.
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image is too large. Max size is 15MB.");
      return;
    }

    const uploadPromise = async () => {
      const compressed = await compressImage(file);

      const formData = new FormData();
      formData.append("image", compressed, "photo.jpg");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      onChange(data.url);
      return data.url;
    };

    setIsUploading(true);
    toast.promise(uploadPromise(), {
      loading: "Uploading member portrait...",
      success: "Portrait uploaded successfully!",
      error: (err) => err.message,
      finally: () => {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
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
