import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryCarouselProps {
  categoryName: string;
  itemCount: number;
  onPrev: () => void;
  onNext: () => void;
  onGridView: () => void;
}

export const CategoryCarousel = ({
  categoryName,
  itemCount,
  onPrev,
  onNext,
  onGridView,
}: CategoryCarouselProps) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(0);
  const threshold = 50;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    // Limit the offset for visual feedback
    setSwipeOffset(Math.max(-100, Math.min(100, diff)));
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (swipeOffset > threshold) {
      onPrev();
    } else if (swipeOffset < -threshold) {
      onNext();
    }
    setSwipeOffset(0);
    setIsSwiping(false);
  }, [swipeOffset, onPrev, onNext]);

  // Calculate visual feedback styles
  const getSwipeIndicatorOpacity = () => Math.min(Math.abs(swipeOffset) / 50, 1);
  const isSwipingLeft = swipeOffset < -20;
  const isSwipingRight = swipeOffset > 20;

  return (
    <div 
      className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-md transition-shadow duration-300 animate-scale-in relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isSwiping ? `translateX(${swipeOffset * 0.3}px)` : 'translateX(0)',
        transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {/* Left swipe indicator */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-primary/30 to-transparent flex items-center justify-center pointer-events-none transition-opacity"
        style={{ opacity: isSwipingRight ? getSwipeIndicatorOpacity() : 0 }}
      >
        <ChevronLeft className="w-8 h-8 text-primary animate-pulse" />
      </div>

      {/* Right swipe indicator */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-primary/30 to-transparent flex items-center justify-center pointer-events-none transition-opacity"
        style={{ opacity: isSwipingLeft ? getSwipeIndicatorOpacity() : 0 }}
      >
        <ChevronRight className="w-8 h-8 text-primary animate-pulse" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onPrev}
          className={`w-11 h-11 rounded-xl border border-border bg-surface-light text-primary cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/30 ${isSwipingRight ? 'scale-110 bg-primary/20' : ''}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center flex-1">
          <h4 className="font-black text-primary text-xl uppercase tracking-wider mb-1">
            {categoryName}
          </h4>
          <p className="text-muted-foreground font-bold text-xs">
            {itemCount} indexed items
          </p>
          <button
            onClick={onGridView}
            className="mt-3 bg-primary text-primary-foreground font-extrabold rounded-xl px-4 py-1.5 text-xs uppercase tracking-wide transition-all duration-200 hover:bg-primary/90"
          >
            GRID VIEW
          </button>
        </div>
        
        <button
          onClick={onNext}
          className={`w-11 h-11 rounded-xl border border-border bg-surface-light text-primary cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/30 ${isSwipingLeft ? 'scale-110 bg-primary/20' : ''}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
