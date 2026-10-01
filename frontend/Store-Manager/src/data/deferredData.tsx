import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"

export const deferredProducts: Array<CatalogProduct & { quantity: number }> = [
  { id: "fresh-milk", name: "Fresh milk", unit: "carton", quantity: 24 },
  { id: "chicken", name: "Chicken", unit: "kg", quantity: 20 },
  {
    id: "frozen-vegetables",
    name: "Frozen vegetables",
    unit: "box",
    quantity: 10,
  },
  { id: "yoghurt", name: "Yoghurt", unit: "crate", quantity: 8 },
]


export const deferredStages = [
  "Order confirmed",
  "Deferred",
  "Awaiting reschedule",
  "Scheduled",
  "Delivery",
]






