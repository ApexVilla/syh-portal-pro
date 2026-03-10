import { Skeleton } from '@/components/ui/skeleton';

export function DataTableSkeleton({ cols = 5, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1 bg-accent" />
          ))}
        </div>
      ))}
    </div>
  );
}
