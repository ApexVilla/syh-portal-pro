import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-card p-6 space-y-4 group overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 p-8 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">{title}</span>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/5">
          {icon}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-8 w-32 bg-white/5" />
      ) : (
        <div className="relative z-10">
          <p className="text-3xl font-extrabold premium-gradient-text tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80",
              subtitleColor || "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

