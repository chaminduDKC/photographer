export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-12 bg-brand-200 rounded-sm" />
        <div className="h-4 w-3 bg-brand-100 rounded-sm" />
        <div className="h-4 w-24 bg-brand-200 rounded-sm" />
      </div>

      {/* Header skeleton */}
      <div className="mb-10">
        <div className="h-9 w-48 sm:w-64 bg-brand-200 rounded-md mb-3" />
        <div className="h-4 w-20 bg-brand-100 rounded-sm" />
      </div>

      {/* Albums Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden bg-white border border-brand-100 shadow-xs"
          >
            <div className="aspect-[4/3] skeleton" />
            <div className="p-4">
              <div className="h-5 w-3/4 bg-brand-200 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
