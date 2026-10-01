// src/hooks/useSwipe.ts - Pointer-based drag and threshold completion hook

import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseSwipeOptions {
  isReady: boolean;
  selectedRouteNumber?: number;
  threshold?: number;
  onComplete: () => void;
  onTrackCompletion?: () => void;
}

export function useSwipe({
  isReady,
  selectedRouteNumber,
  threshold = 0.85,
  onComplete,
  onTrackCompletion
}: UseSwipeOptions) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragProgress, setDragProgress] = useState(0); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);
  const [isNudging, setIsNudging] = useState(false);
  const prevRouteRef = useRef<number | undefined>(selectedRouteNumber);

  // Trigger one soft ring pulse and 14px nudge on route activation
  useEffect(() => {
    if (selectedRouteNumber && selectedRouteNumber !== prevRouteRef.current) {
      setIsNudging(true);
      const timer = setTimeout(() => setIsNudging(false), 400);
      prevRouteRef.current = selectedRouteNumber;
      return () => clearTimeout(timer);
    }
    prevRouteRef.current = selectedRouteNumber;
  }, [selectedRouteNumber]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isReady) return;
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isReady]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const knobWidth = 48;
      const maxDrag = rect.width - knobWidth - 8;
      const currentX = e.clientX - rect.left - 24;
      const progress = Math.max(0, Math.min(1, currentX / maxDrag));
      setDragProgress(progress);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !trackRef.current) return;
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}

      if (dragProgress >= threshold) {
        setDragProgress(1);
        if (onTrackCompletion) onTrackCompletion();
        setTimeout(() => {
          onComplete();
          setDragProgress(0);
        }, 150);
      } else {
        setDragProgress(0);
      }
    },
    [isDragging, dragProgress, threshold, onTrackCompletion, onComplete]
  );

  const knobOffsetPx = trackRef.current
    ? dragProgress * (trackRef.current.clientWidth - 56)
    : dragProgress * 300;

  return {
    trackRef,
    dragProgress,
    isDragging,
    isNudging,
    knobOffsetPx,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}
