import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
  );

  return (
    <nav className="flex items-center gap-1.5" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors border border-slate-200"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {visiblePages.map((p, i) => {
        const prev = visiblePages[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {showEllipsis && (
              <span className="px-1 text-sm text-slate-400 font-medium">…</span>
            )}
            <button
              onClick={() => onPageChange(p)}
              className={cn(
                'h-9 w-9 rounded-lg text-sm font-semibold transition-all shadow-sm',
                p === page
                  ? 'bg-primary-600 text-white shadow-primary-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 bg-white'
              )}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors border border-slate-200"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
