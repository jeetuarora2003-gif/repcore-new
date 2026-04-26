import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-accent animate-spin" strokeWidth={3} />
        <div className="absolute inset-0 blur-xl bg-accent/20 animate-pulse rounded-full" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-bold text-text-primary uppercase tracking-widest">Loading RepCore</p>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Synchronizing Data...</p>
      </div>
    </div>
  );
}
