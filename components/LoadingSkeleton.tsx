"use client";

export function CardSkeleton() {
  return (
    <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[#1C1C2E]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#1C1C2E] rounded w-3/4" />
          <div className="h-3 bg-[#1C1C2E] rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4 animate-pulse">
      <div className="h-3 bg-[#1C1C2E] rounded w-1/2 mb-3" />
      <div className="h-8 bg-[#1C1C2E] rounded w-3/4" />
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
