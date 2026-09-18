export default function AlbumLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-12 bg-brand-200 rounded-sm" />
        <div className="h-4 w-3 bg-brand-100 rounded-sm" />
        <div className="h-4 w-20 bg-brand-200 rounded-sm" />
        <div className="h-4 w-3 bg-brand-100 rounded-sm" />
        <div className="h-4 w-28 bg-brand-200 rounded-sm" />
      </div>

      {/* Album Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-brand-100">
        <div>
          <div className="h-5 w-20 bg-brand-200 rounded-full mb-3" />
          <div className="h-9 w-60 sm:w-80 bg-brand-200 rounded-md mb-2" />
          <div className="h-4 w-28 bg-brand-100 rounded-sm" />
        </div>
        <div className="h-10 w-44 bg-brand-200 rounded-full" />
      </div>

      {/* Photos Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-xl overflow-hidden skeleton"
          />
        ))}
      </div>
    </div>
  );
}
