import { cn } from '../../utils/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-primary-600',
        className
      )}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Spinner className="h-10 w-10" />
    </div>
  );
}
