import React, { createContext, useContext, useState, useEffect, useRef, useMemo, type ReactNode } from "react"
import type { OrderType, OrderDrafts, OrderDetailState, ReceiptFlowState } from "../types"
import { mockDrafts } from "../data/mockDrafts"
import { getDefaultOrderType } from "../utils"
import { getStoreContext } from "../services/store"

export type StoreView =
  | "home"
  | "orders"
  | "deliveries"
  | "new-order"
  | "review"
  | "confirmation"
  | "order-detail"
  | "deferred-detail"
  | "verify-delivery"

export type BusinessType = "fresh" | "style" | "tech"

export interface StoreContextValue {
  business: BusinessType
  setBusiness: (b: BusinessType) => void
  handleBusinessChange: (b: BusinessType) => void
  orderType: OrderType
  setOrderType: (t: OrderType) => void
  drafts: OrderDrafts
  setDrafts: React.Dispatch<React.SetStateAction<OrderDrafts>>
  view: StoreView
  setView: React.Dispatch<React.SetStateAction<StoreView>>
  currentNav: string
  navigate: (label: string) => void
  directionRef: React.MutableRefObject<number>
  pageVariants: {
    enter: (direction: number) => { x: number; opacity: number }
    center: { x: number; opacity: number }
    exit: (direction: number) => { x: number; opacity: number }
  }
  selectedOrderId: string
  setSelectedOrderId: (id: string) => void
  handleOpenOrder: (id: string, nextView: string, state?: string) => void
  orderDetailState: OrderDetailState
  setOrderDetailState: (s: OrderDetailState) => void
  receiptFlowState: ReceiptFlowState
  setReceiptFlowState: (s: ReceiptFlowState) => void
  prototypeMode: boolean
  prototypeState: string | null
  prototypeView: string | null
  showAttention: boolean
  afterCutoff: boolean
  showUpcoming: boolean
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined)

const viewIndex: Record<string, number> = { home: 0, orders: 1, deliveries: 2 }

export function StoreProvider({ children }: { children: ReactNode }) {
  const params = useMemo(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""), [])
  const prototypeState = params.get("state")
  const prototypeView = params.get("view")
  const initialBusiness = (params.get("business") as BusinessType) || "fresh"

  const [business, setBusiness] = useState<BusinessType>(initialBusiness)
  const prototypeMode = import.meta.env.VITE_ALLOW_UNAUTHENTICATED_PROTOTYPE === "true"
  const showAttention = prototypeState !== "no-attention"
  const afterCutoff = prototypeState === "after-cutoff"
  const showUpcoming = prototypeState !== "no-upcoming"

  const initialOrderType: OrderType = prototypeState === "chilled" ? "chilled" : getDefaultOrderType(initialBusiness)
  const [orderType, setOrderType] = useState<OrderType>(initialOrderType)

  function handleBusinessChange(newBusiness: BusinessType) {
    setBusiness(newBusiness)
    setOrderType(getDefaultOrderType(newBusiness))
  }

  const [drafts, setDrafts] = useState<OrderDrafts>(() => {
    if (prototypeMode && prototypeState !== "empty") {
      return { ...(mockDrafts[initialBusiness] as OrderDrafts) }
    }
    return { dry: {}, chilled: {}, products: {} }
  })

  useEffect(() => {
    if (prototypeMode) return
    void getStoreContext().then((context) => {
      const outletBusiness = context.outlet.brand.toLowerCase()
      if (outletBusiness === "fresh" || outletBusiness === "style" || outletBusiness === "tech") {
        handleBusinessChange(outletBusiness)
      }
    }).catch((error) => console.error("Store context request failed", error))
  }, [prototypeMode])

  useEffect(() => {
    if (prototypeMode && prototypeState !== "empty") {
      setDrafts({ ...(mockDrafts[business] as OrderDrafts) })
    }
  }, [business, prototypeMode, prototypeState])

  const initialView: StoreView = useMemo(() => {
    if (
      prototypeView === "new-order" ||
      prototypeView === "orders" ||
      prototypeView === "deliveries" ||
      prototypeView === "review" ||
      prototypeView === "confirmation" ||
      prototypeView === "order-detail" ||
      prototypeView === "verify-delivery"
    ) {
      return prototypeView as StoreView
    }
    return "home"
  }, [prototypeView])

  const [view, setView] = useState<StoreView>(initialView)

  const currentNav = useMemo(() => {
    if (view === "home" || view === "new-order" || view === "review" || view === "confirmation") return "Home"
    if (view === "orders" || view === "order-detail") return "Orders"
    if (view === "deliveries" || view === "verify-delivery") return "Deliveries"
    return "Home"
  }, [view])

  const initialOrderDetailState: OrderDetailState =
    prototypeState === "scheduled" ||
    prototypeState === "on-way" ||
    prototypeState === "arrived" ||
    prototypeState === "awaiting-confirmation" ||
    prototypeState === "receipt-confirmed" ||
    prototypeState === "receipt-issue"
      ? prototypeState
      : "confirmed"

  const [orderDetailState, setOrderDetailState] = useState<OrderDetailState>(initialOrderDetailState)

  const initialReceiptState: ReceiptFlowState =
    prototypeState === "full"
      ? "full"
      : prototypeState === "issue-edit"
        ? "issue-edit"
        : prototypeState === "issue-review"
          ? "issue-review"
          : prototypeState === "receipt-confirmed"
            ? "confirmed"
            : prototypeState === "receipt-confirmed-issue"
              ? "confirmed-issue"
              : "verify"

  const [receiptFlowState, setReceiptFlowState] = useState<ReceiptFlowState>(initialReceiptState)
  const [selectedOrderId, setSelectedOrderId] = useState<string>("ORD-1082")

  function handleOpenOrder(id: string, nextView: string, state?: string) {
    setSelectedOrderId(id)
    if (state) {
      if (nextView === "order-detail") setOrderDetailState(state as OrderDetailState)
      if (nextView === "verify-delivery") setReceiptFlowState(state as ReceiptFlowState)
    }
    setView(nextView as StoreView)
  }

  const directionRef = useRef(0)

  const pageVariants = useMemo(() => ({
    enter: (direction: number) => ({ x: direction * 24, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction * -24, opacity: 0 }),
  }), [])

  function navigate(label: string) {
    const nextView = label.toLowerCase() as "home" | "orders" | "deliveries"
    const currentIndex = viewIndex[view] ?? 0
    const nextIndex = viewIndex[nextView] ?? 0
    if (nextIndex !== currentIndex) {
      directionRef.current = nextIndex > currentIndex ? 1 : -1
    }
    setView(nextView)
  }

  const value: StoreContextValue = {
    business,
    setBusiness,
    handleBusinessChange,
    orderType,
    setOrderType,
    drafts,
    setDrafts,
    view,
    setView,
    currentNav,
    navigate,
    directionRef,
    pageVariants,
    selectedOrderId,
    setSelectedOrderId,
    handleOpenOrder,
    orderDetailState,
    setOrderDetailState,
    receiptFlowState,
    setReceiptFlowState,
    prototypeMode,
    prototypeState,
    prototypeView,
    showAttention,
    afterCutoff,
    showUpcoming,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
