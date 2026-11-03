import { useState, useEffect } from 'react';

/**
 * Custom hook to smoothly animate numeric statistics on mount or change.
 * Supports prefers-reduced-motion accessibility setting.
 */
export function useAnimatedCounter(targetValue: number, duration: number = 600): number {
  const [currentValue, setCurrentValue] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return targetValue;
    }
    return 0;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (isNaN(targetValue) || targetValue <= 0) {
      return;
    }

    let startTimestamp: number | null = null;
    const startValue = 0;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out-cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(startValue + (targetValue - startValue) * easeProgress);
      setCurrentValue(nextVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrentValue(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, duration]);

  return currentValue;
}
