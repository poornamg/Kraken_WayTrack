// src/hooks/useTableSort.ts - Generic sorting hook for tabular data

import { useState, useMemo, useCallback } from 'react'

export type SortDirection = 'asc' | 'desc'

export function useTableSort<T>(items: T[], initialKey?: keyof T, initialDirection: SortDirection = 'asc') {
  const [sortKey, setSortKey] = useState<keyof T | undefined>(initialKey)
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection)

  const toggleSort = useCallback((key: keyof T) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'))
        return key
      }
      setSortDirection('asc')
      return key
    })
  }, [])

  const sortedItems = useMemo(() => {
    if (!sortKey) return items

    return [...items].sort((a, b) => {
      const valA = a[sortKey]
      const valB = b[sortKey]

      if (valA === valB) return 0
      if (valA == null) return 1
      if (valB == null) return -1

      let comparison = 0
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB
      } else {
        comparison = String(valA).localeCompare(String(valB))
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [items, sortKey, sortDirection])

  return {
    sortKey,
    sortDirection,
    toggleSort,
    setSortKey,
    setSortDirection,
    sortedItems
  }
}
