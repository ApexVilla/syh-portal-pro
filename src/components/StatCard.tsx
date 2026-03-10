import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  loading?: boolean;
  subtitleColor?: string;
}

export function StatCard({ title, value, subtitle, icon, loading, subtitleColor }: StatCardProps) {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-32 bg-accent" />
      ) : (
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className={`text-xs mt-1 ${subtitleColor || 'text-muted-foreground'}`}>{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}
