export default function Loading() {
  return (
    <div className="w-full space-y-6 animate-pulse p-2">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-border rounded-md" />
        <div className="h-8 w-48 bg-border rounded-md" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white border border-border rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-white border border-border rounded-xl w-full" />
    </div>
  );
}
