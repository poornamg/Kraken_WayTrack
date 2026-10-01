// src/hooks/usePinEntry.ts - Manages 4-digit PIN buffer and keypad input

import { useState, useCallback } from 'react';

export interface UsePinEntryOptions {
  maxLength?: number;
  onComplete?: (pin: string) => void;
  disabled?: boolean;
}

export function usePinEntry({
  maxLength = 4,
  onComplete,
  disabled = false
}: UsePinEntryOptions = {}) {
  const [pin, setPin] = useState('');

  const appendDigit = useCallback(
    (digit: string) => {
      if (disabled) return;
      if (pin.length >= maxLength) return;

      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === maxLength && onComplete) {
        onComplete(newPin);
      }
    },
    [disabled, pin, maxLength, onComplete]
  );

  const backspace = useCallback(() => {
    if (disabled) return;
    setPin((prev) => prev.slice(0, -1));
  }, [disabled]);

  const clear = useCallback(() => {
    if (disabled) return;
    setPin('');
  }, [disabled]);

  return {
    pin,
    setPin,
    appendDigit,
    backspace,
    clear,
    isComplete: pin.length === maxLength
  };
}
