"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        ref={ref}
        className="relative bg-[#13131F] border border-[#1E1E30] rounded-t-3xl animate-slide-up max-h-[92vh] flex flex-col"
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="h-1 w-8 bg-[#1E1E30] rounded-full" />
        </div>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 shrink-0">
            <h2 className="text-lg font-semibold text-[#F1F5F9]">{title}</h2>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-[#1C1C2E] flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
