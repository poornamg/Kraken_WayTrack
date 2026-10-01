import { useState, useMemo } from "react"

export type OrderFilterTab = "all" | "confirmed" | "scheduled" | "delivered" | "deferred"

export function useOrderFilters<T extends { id?: string; orderNumber?: string; status?: string; requestedDate?: string }>(orders: T[]) {
  const [filter, setFilter] = useState<OrderFilterTab>("all")
  const [search, setSearch] = useState("")

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch = search.trim() === "" ||
        (order.id && order.id.toLowerCase().includes(search.toLowerCase())) ||
        (order.orderNumber && order.orderNumber.toLowerCase().includes(search.toLowerCase()))

      if (!matchSearch) return false

      if (filter === "all") return true
      if (filter === "confirmed") return order.status === "confirmed" || order.status === "submitted"
      if (filter === "scheduled") return order.status === "scheduled" || order.status === "allocated"
      if (filter === "delivered") return order.status === "delivered" || order.status === "in_transit"
      if (filter === "deferred") return order.status === "deferred"

      return true
    })
  }, [orders, filter, search])

  return {
    filter,
    setFilter,
    search,
    setSearch,
    filteredOrders,
  }
}
