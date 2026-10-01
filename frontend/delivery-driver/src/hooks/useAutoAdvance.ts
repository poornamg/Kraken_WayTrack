// src/hooks/useAutoAdvance.ts - Timer hook for automatic screen transitions with delay

import { useRef, useEffect, useCallback } from 'react';

export interface UseAutoAdvanceOptions {
  delay?: number;
  onAdvance: () => void;
  enabled?: boolean;
}

export function useAutoAdvance({
  delay = 1250,
  onAdvance,
  enabled = false
}: UseAutoAdvanceOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAdvancedRef = useRef<boolean>(false);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const trigger = useCallback(() => {
    cancel();
    if (!hasAdvancedRef.current) {
      hasAdvancedRef.current = true;
      onAdvance();
    }
  }, [cancel, onAdvance]);

  useEffect(() => {
    if (!enabled) {
      cancel();
      return;
    }

    timerRef.current = setTimeout(() => {
      trigger();
    }, delay);

    return () => cancel();
  }, [enabled, delay, trigger, cancel]);

  return {
    cancel,
    trigger
  };
}
