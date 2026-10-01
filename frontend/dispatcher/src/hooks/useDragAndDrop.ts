// src/hooks/useDragAndDrop.ts - Hook for drag-and-drop state between order lists and vehicles

import { useState, useCallback } from 'react'
import { Order } from '@/types'

export function useDragAndDrop() {
  const [draggedOrder, setDraggedOrder] = useState<Order | null>(null)
  const [isOverTarget, setIsOverTarget] = useState(false)

  const handleDragStart = useCallback((order: Order) => {
    setDraggedOrder(order)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedOrder(null)
    setIsOverTarget(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsOverTarget(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsOverTarget(false)
  }, [])

  return {
    draggedOrder,
    isOverTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    setDraggedOrder
  }
}
