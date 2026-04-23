"use client";

import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, message, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="h-14 w-14 rounded-2xl bg-[#1C1C2E] flex items-center justify-center">
        <Icon size={28} className="text-[#94A3B8]" />
      </div>
      <p className="text-[#94A3B8] text-sm">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="h-10 px-5 rounded-xl bg-[#6366F1] text-white text-sm font-semibold active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
