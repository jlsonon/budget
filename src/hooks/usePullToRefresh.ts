import { useEffect, useState } from 'react';

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);

  useEffect(() => {
    let startY = 0;
    let isPulling = false;
    const threshold = 80;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;
      
      const y = e.touches[0].clientY;
      const pullDistance = y - startY;

      if (pullDistance > 0 && window.scrollY === 0) {
        e.preventDefault();
        setPullProgress(Math.min(pullDistance / threshold, 1));
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      isPulling = false;

      if (pullProgress >= 1 && !isRefreshing) {
        setIsRefreshing(true);
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullProgress(0);
        }
      } else {
        setPullProgress(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, isRefreshing, pullProgress]);

  return { isRefreshing, pullProgress };
}
