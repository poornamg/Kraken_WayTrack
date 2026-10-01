// src/hooks/useKeyboardShortcuts.ts - Keyboard shortcuts listener

import { useEffect, useRef } from 'react'

export interface KeyHandlerMap {
  [key: string]: (e: KeyboardEvent) => void
}

export function useKeyboardShortcuts(handlers: KeyHandlerMap, enabled = true) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      const handler = handlersRef.current[event.key]
      if (handler) {
        handler(event)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled])
}
