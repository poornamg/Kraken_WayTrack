import { useEffect, useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "../components/ui/Button"
import { OrderFilters, OrderCard, type OrderItem } from "../components/orders"
import type { StatusKind } from "../types/index"
import { listStoreOrders } from "../services/store"

export function OrdersPage({
  business,
  onNewOrder,
  onOpenOrder,
}: {
  business: "fresh" | "style" | "tech"
  onNewOrder: () => void
  onOpenOrder: (id: string, view: string, state: string) => void
}) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [orders, setOrders] = useState<OrderItem[]>([])

  const statuses = [
    "All",
    "Order confirmed",
    "Scheduled",
    "On the way",
    "Deferred",
    "Awaiting confirmation",
    "Receipt confirmed",
  ]

  useEffect(() => {
    const fetchOrders = () => {
      listStoreOrders(business)
        .then((data) => {
          const formatted: OrderItem[] = data.map((o) => ({
            id: o.id,
            type: o.type,
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Today",
            statusLabel:
              o.status === "Scheduled"
                ? "Scheduled"
                : o.status === "Deferred"
                  ? "Deferred"
                  : "Order confirmed",
            status: (o.status === "Scheduled"
              ? "scheduled"
              : o.status === "Deferred"
                ? "deferred"
                : "confirmed") as StatusKind,
            view: "order-detail",
            state:
              o.status === "Deferred"
                ? "deferred"
                : o.status === "Scheduled"
                  ? "scheduled"
                  : "confirmed",
          }))
          setOrders(formatted)
        })
        .catch(console.error)
    }
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [business])

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "All" || o.statusLabel === statusFilter)
  )

  return (
    <div className="list-container">
      <div className="home-page-header">
        <div>
          <div className="page-title">Orders</div>
          <p>Track your store orders from submission through delivery.</p>
        </div>
        <Button icon={<Plus />} tone="primary" onClick={onNewOrder}>
          New order
        </Button>
      </div>

      <OrderFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statuses={statuses}
      />

      <div className="upcoming-list" style={{ marginTop: "var(--space-6)" }}>
        {filtered.length > 0 ? (
          filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => onOpenOrder(order.id, order.view, order.state)}
            />
          ))
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-8) 0",
              color: "var(--text-secondary)",
            }}
          >
            <Search
              style={{
                margin: "0 auto var(--space-2)",
                opacity: 0.5,
                display: "block",
              }}
            />
            <p style={{ margin: 0 }}>
              No orders found. Try another order ID or status filter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
