export default function MembersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="sticky top-[56px] z-20 -mx-6 px-6 py-4 bg-page/80 backdrop-blur-md border-b border-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="h-12 bg-white border border-border rounded-xl flex-1" />
          <div className="flex gap-3">
            <div className="h-12 w-12 rounded-full bg-white border border-border" />
            <div className="h-12 w-32 rounded-full bg-accent/10" />
          </div>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-9 w-20 rounded-full bg-white border border-border" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 bg-white border border-border rounded-xl" />
        ))}
      </div>
    </div>
  );
}
