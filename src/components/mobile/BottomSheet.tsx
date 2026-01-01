import { useRef, useState, useCallback, useEffect } from 'react';
import { X, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
}

export const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.4, 0.85],
}: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [currentSnap, setCurrentSnap] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef(0);

  const currentHeight = snapPoints[currentSnap] * 100;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY.current;
    setDragOffset(Math.max(0, deltaY));
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    if (dragOffset > 100) {
      // Close if dragged down significantly
      if (currentSnap === 0) {
        onClose();
      } else {
        setCurrentSnap(currentSnap - 1);
      }
    } else if (dragOffset < -50 && currentSnap < snapPoints.length - 1) {
      // Expand if dragged up
      setCurrentSnap(currentSnap + 1);
    }
    
    setDragOffset(0);
  }, [dragOffset, currentSnap, snapPoints.length, onClose]);

  useEffect(() => {
    if (isOpen) {
      setCurrentSnap(0);
      setDragOffset(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl z-50 shadow-2xl",
          !isDragging && "transition-all duration-300 ease-out"
        )}
        style={{
          height: `${currentHeight}vh`,
          transform: `translateY(${dragOffset}px)`,
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto h-full pb-safe px-4">
          {children}
        </div>
      </div>
    </>
  );
};
