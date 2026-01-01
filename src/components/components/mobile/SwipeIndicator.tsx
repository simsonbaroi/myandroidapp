import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeIndicatorProps {
  direction: 'left' | 'right' | null;
  label?: string;
}

export const SwipeIndicator = ({ direction, label }: SwipeIndicatorProps) => {
  if (!direction) return null;

  return (
    <div
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-primary/90 text-primary-foreground font-semibold text-sm animate-fade-in shadow-lg",
        direction === 'left' ? 'right-4' : 'left-4'
      )}
    >
      {direction === 'right' && <ChevronLeft className="w-4 h-4" />}
      {label && <span>{label}</span>}
      {direction === 'left' && <ChevronRight className="w-4 h-4" />}
    </div>
  );
};
