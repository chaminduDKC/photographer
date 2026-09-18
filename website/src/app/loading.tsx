export default function GlobalLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 animate-pulse">
      <div className="h-8 w-48 bg-brand-200 rounded-md mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] rounded-2xl skeleton" />
        ))}
      </div>
    </div>
  );
}
