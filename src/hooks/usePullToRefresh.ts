import { useState, useRef, useCallback, useEffect } from 'react';

interface PullToRefreshConfig {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPull?: number;
}

export const usePullToRefresh = (config: PullToRefreshConfig) => {
  const { onRefresh, threshold = 80, maxPull = 120 } = config;
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    
    // Apply resistance for a natural feel
    const resistedDistance = Math.min(distance * 0.5, maxPull);
    setPullDistance(resistedDistance);
  }, [isPulling, isRefreshing, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      // Haptic feedback simulation via vibration API
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      await onRefresh();
      setIsRefreshing(false);
    }
    
    setPullDistance(0);
    setIsPulling(false);
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  const pullProgress = Math.min(pullDistance / threshold, 1);

  return {
    pullDistance,
    isRefreshing,
    pullProgress,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
