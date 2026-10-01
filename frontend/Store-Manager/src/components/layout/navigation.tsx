import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { Home, ShoppingBag, Truck } from "lucide-react"

export const navigation = [
  { label: "Home", icon: Home },
  { label: "Orders", icon: ShoppingBag },
  { label: "Deliveries", icon: Truck },
]


