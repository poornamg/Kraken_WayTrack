import { useEffect, useState, useCallback } from "react"
import { listStoreOrders } from "../services/store"

export function useOrdersPolling(business: "fresh" | "style" | "tech", pollIntervalMs = 5000) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const data = await listStoreOrders(business)
      setOrders(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }, [business])

  useEffect(() => {
    setLoading(true)
    void fetchOrders()

    const interval = setInterval(() => {
      void fetchOrders()
    }, pollIntervalMs)

    return () => clearInterval(interval)
  }, [fetchOrders, pollIntervalMs])

  return { orders, loading, error, refresh: fetchOrders }
}
