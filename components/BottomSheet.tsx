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
        className="absolute inset-0 bg-[#080810]/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        ref={ref}
        className="relative bg-surface border-t border-x border-white/10 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col"
      >
        {/* Drag handle */}
        <div className="pt-4 pb-2 flex justify-center shrink-0">
          <div className="h-1.5 w-12 bg-white/5 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <h2 className="text-lg font-bold tracking-tight text-[#F8FAFC]">{title}</h2>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-[#475569] hover:text-[#F8FAFC] hover:bg-white/10 transition-all active:scale-90"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 pb-10 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}
