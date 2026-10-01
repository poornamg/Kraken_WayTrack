// src/hooks/useOrderFilters.ts - Filtering and searching orders by shop type, status, and query

import { useState, useMemo, useCallback } from 'react'
import { Order, ShopType } from '@/types'

export interface OrderFilterOptions {
  initialSearch?: string
  initialShopType?: ShopType | null
  initialStatus?: string
}

export function useOrderFilters(orders: Order[], options: OrderFilterOptions = {}) {
  const [searchQuery, setSearchQuery] = useState(options.initialSearch ?? '')
  const [shopTypeFilter, setShopTypeFilter] = useState<ShopType | null>(options.initialShopType ?? null)
  const [statusFilter, setStatusFilter] = useState<string>(options.initialStatus ?? 'All')

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (shopTypeFilter && order.type !== shopTypeFilter) {
        return false
      }

      if (statusFilter === 'Scheduled' && !order.stop) {
        return false
      }
      if (statusFilter === 'Deferred' && !order.deferred) {
        return false
      }
      if (statusFilter === 'Pending' && (order.stop || order.deferred)) {
        return false
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchId = order.id.toLowerCase().includes(query)
        const matchShop = order.shop.toLowerCase().includes(query)
        const matchTown = order.town.toLowerCase().includes(query)
        const matchItems = order.items.toLowerCase().includes(query)
        if (!matchId && !matchShop && !matchTown && !matchItems) {
          return false
        }
      }

      return true
    })
  }, [orders, shopTypeFilter, statusFilter, searchQuery])

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setShopTypeFilter(null)
    setStatusFilter('All')
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    shopTypeFilter,
    setShopTypeFilter,
    statusFilter,
    setStatusFilter,
    filteredOrders,
    resetFilters
  }
}
