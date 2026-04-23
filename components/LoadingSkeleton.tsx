"use client";

export function CardSkeleton() {
  return (
    <div className="bg-[#18181B] border border-[#3F3F46] rounded-2xl p-4 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer" />
      <div className="flex items-center gap-3 relative z-10">
        <div className="h-10 w-10 rounded-full bg-[#27272A]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#27272A] rounded w-3/4" />
          <div className="h-3 bg-[#27272A] rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-[#18181B] border border-[#3F3F46] rounded-2xl p-4 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer" />
      <div className="relative z-10">
        <div className="h-3 bg-[#27272A] rounded w-1/2 mb-3" />
        <div className="h-8 bg-[#27272A] rounded w-3/4" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
