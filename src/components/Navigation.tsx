import { useState } from 'react';
import { Home, UserCheck, BedDouble, Tags, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useLocalBilling } from '@/contexts/LocalBillingContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { ViewType } from '@/types/billing';
import { cn } from '@/lib/utils';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useClock } from '@/hooks/useClock';

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5" />,
  UserCheck: <UserCheck className="w-5 h-5" />,
  BedDouble: <BedDouble className="w-5 h-5" />,
  Tags: <Tags className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
};

export const Navigation = () => {
  const { currentView, setCurrentView } = useLocalBilling();
  const { settings } = useAppSettings();
  const time = useClock();
  const [swipeHint, setSwipeHint] = useState<'left' | 'right' | null>(null);

  const visibleButtons = settings.navButtons.filter(btn => btn.visible);
  
  // Get current view index
  const currentIndex = visibleButtons.findIndex(btn => btn.id === currentView);
  
  // Touch gesture navigation with visual feedback
  const navigateToNext = () => {
    if (currentIndex < visibleButtons.length - 1) {
      setSwipeHint('left');
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(20);
      setTimeout(() => {
        setCurrentView(visibleButtons[currentIndex + 1].id as ViewType);
        setSwipeHint(null);
      }, 150);
    }
  };

  const navigateToPrev = () => {
    if (currentIndex > 0) {
      setSwipeHint('right');
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(20);
      setTimeout(() => {
        setCurrentView(visibleButtons[currentIndex - 1].id as ViewType);
        setSwipeHint(null);
      }, 150);
    }
  };

  const { touchHandlers } = useTouchGestures({
    onSwipeLeft: navigateToNext,
    onSwipeRight: navigateToPrev,
    threshold: 50,
  });

  const canGoNext = currentIndex < visibleButtons.length - 1;
  const canGoPrev = currentIndex > 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 mb-4 sm:mb-6" {...touchHandlers}>
      {/* Desktop Navigation */}
      <nav className="hidden sm:flex bg-secondary/50 p-1.5 rounded-2xl border border-border gap-1.5">
        {visibleButtons.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as ViewType)}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl border-none font-bold text-xs cursor-pointer flex flex-col md:flex-row items-center justify-center gap-2 transition-all duration-200 uppercase",
              currentView === item.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-light"
            )}
          >
            {iconMap[item.icon] || <Home className="w-5 h-5" />}
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Navigation - Enhanced with swipe indicators */}
      <div className="sm:hidden">
        <nav className="flex bg-secondary/50 p-1 rounded-xl border border-border gap-0.5 relative">
          {/* Swipe hint indicators */}
          {canGoPrev && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 text-muted-foreground/50">
              <ChevronLeft className="w-4 h-4" />
            </div>
          )}
          {canGoNext && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 text-muted-foreground/50">
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
          
          {visibleButtons.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                setCurrentView(item.id as ViewType);
              }}
              className={cn(
                "flex-1 py-2.5 px-2 rounded-lg border-none font-bold text-[10px] cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-200 uppercase touch-feedback no-select",
                currentView === item.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-transparent text-muted-foreground",
                swipeHint === 'left' && currentView === item.id && "translate-x-2 opacity-70",
                swipeHint === 'right' && currentView === item.id && "-translate-x-2 opacity-70"
              )}
            >
              {iconMap[item.icon] || <Home className="w-4 h-4" />}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Mobile Clock & Swipe hint */}
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-xs text-muted-foreground/60">
            {canGoPrev || canGoNext ? '← Swipe to navigate →' : ''}
          </span>
          <span className="text-primary font-mono font-bold text-sm">
            {time}
          </span>
        </div>
      </div>
    </div>
  );
};
