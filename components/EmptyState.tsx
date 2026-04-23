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
    <div className="flex flex-col items-center justify-center py-12 gap-6 text-center animate-fade-up">
      <div className="h-20 w-20 rounded-3xl bg-white border border-border flex items-center justify-center shadow-sm">
        <Icon size={32} className="text-text-muted opacity-40" />
      </div>
      <div className="space-y-1">
        <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">{message}</p>
        <p className="text-text-muted text-[11px] font-medium max-w-[280px]">No records found for the selected criteria. Try adjusting your filters or adding new data.</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="h-11 px-8 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-accent/20 active:scale-95 transition-all hover:bg-accent-hover"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
