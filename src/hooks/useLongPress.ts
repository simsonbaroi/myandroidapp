import { useRef, useCallback } from 'react';

interface LongPressConfig {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

export const useLongPress = (config: LongPressConfig) => {
  const { onLongPress, onClick, delay = 500 } = config;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const start = useCallback(() => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const stop = useCallback((event?: React.MouseEvent | React.TouchEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Only trigger click if it wasn't a long press
    if (!isLongPress.current && onClick) {
      onClick();
    }
    
    // Prevent ghost click on touch devices
    if (event && isLongPress.current) {
      event.preventDefault();
    }
  }, [onClick]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: stop,
    onTouchCancel: cancel,
  };
};
