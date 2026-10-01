import type { ReactNode } from "react"
import { CalendarDays, CheckCircle2, PackageCheck, ReceiptText, Truck } from "lucide-react"
import type { OrderType, CatalogProduct, OrderDrafts, UpcomingDelivery, OrderDetailState, StatusKind } from "../types"
import { formatOrderType, getDefaultOrderType } from "../utils"
import { productCatalog } from "./productCatalog"

export function getUpcomingDeliveries(business: "fresh" | "style" | "tech"): UpcomingDelivery[] {
  return [
    {
      id: "ORD-1065",
      type: formatOrderType(business, business === "fresh" ? "chilled" : getDefaultOrderType(business)),
      date: "Friday, 2 October",
      status: "deferred" as const,
      reason: business === "fresh" ? "Refrigerated capacity" : "Vehicle capacity constraints",
      eta: "New window • 06:50-07:10",
    },
    {
      id: "ORD-1071",
      type: formatOrderType(business, getDefaultOrderType(business)),
      date: "Monday, 5 October",
      status: "confirmed" as const,
      eta: "Not scheduled yet",
    },
  ]
}

export const recentActivity = [
  {
    id: "ORD-1037",
    label: "Receipt confirmed",
    time: "Today · 06:57",
    kind: "received" as StatusKind,
  },
  {
    id: "ORD-1034",
    label: "Receipt confirmed with issue",
    time: "Yesterday",
    kind: "issue" as StatusKind,
  },
  {
    id: "ORD-1029",
    label: "Delivered",
    time: "28 Sep",
    kind: "confirmed" as StatusKind,
  },
]

export function getCatalog(business: "fresh" | "style" | "tech", type: OrderType): CatalogProduct[] {
  const catalog = productCatalog[business] as Record<string, CatalogProduct[]>
  return catalog[type] || []
}

export function getDraft(drafts: OrderDrafts, type: OrderType): Record<string, number> {
  const safeDrafts = drafts as Record<string, Record<string, number>>
  return safeDrafts[type] || {}
}

export const orderActivity: Array<{
  label: string
  time: string
  step: number
  icon: ReactNode
}> = [
  {
    label: "Order received",
    time: "Wed · 13:46",
    step: 0,
    icon: <PackageCheck />,
  },
  {
    label: "Scheduled",
    time: "Wed · 16:35",
    step: 1,
    icon: <CalendarDays />,
  },
  {
    label: "Vehicle departed",
    time: "Thu · 05:48",
    step: 2,
    icon: <Truck />,
  },
  {
    label: "Arrived",
    time: "Thu · 06:43",
    step: 3,
    icon: <CheckCircle2 />,
  },
  {
    label: "Driver completed delivery",
    time: "Thu · 06:52",
    step: 4,
    icon: <ReceiptText />,
  },
]
