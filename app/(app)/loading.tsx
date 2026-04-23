import { Skeleton } from "@/components/ui/skeleton";

export default function GenericAppLoading() {
  return (
    <div className="space-y-10 animate-fade-in p-2">
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-border rounded-[2rem] p-8 space-y-6">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-[2rem] p-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
