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
    <div className="flex flex-col items-center justify-center py-16 gap-5 text-center animate-fade-up">
      <div className="h-16 w-16 rounded-2xl bg-surface border border-white/6 flex items-center justify-center shadow-lg shadow-black/20">
        <Icon size={28} className="text-[#52525B]" />
      </div>
      <p className="text-[#A1A1AA] text-sm font-medium max-w-[240px] leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="h-10 px-6 rounded-xl bg-[#10B981] text-white text-sm font-semibold shadow-lg shadow-[#10B981]/20 active:scale-95 transition-all hover:brightness-110"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
