import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  pullProgress: number;
}

export const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
  pullProgress,
}: PullToRefreshIndicatorProps) => {
  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div
      className="absolute left-0 right-0 flex justify-center z-50 pointer-events-none"
      style={{ top: Math.min(pullDistance - 40, 20) }}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center transition-all",
          isRefreshing && "bg-primary/30"
        )}
        style={{
          transform: `scale(${0.5 + pullProgress * 0.5})`,
          opacity: pullProgress,
        }}
      >
        <RefreshCw
          className={cn(
            "w-5 h-5 text-primary transition-transform",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: isRefreshing ? undefined : `rotate(${pullProgress * 180}deg)`,
          }}
        />
      </div>
    </div>
  );
};
