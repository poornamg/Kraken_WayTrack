import { useState, useCallback, useMemo } from "react"
import type { OrderType, OrderDrafts } from "../types"
import { mockDrafts } from "../data/mockDrafts"
import { getDefaultOrderType } from "../utils"

export function useOrderDraft(
  business: "fresh" | "style" | "tech",
  prototypeMode = false,
  prototypeState?: string | null
) {
  const initialType = (prototypeState === "chilled" && business === "fresh")
    ? "chilled"
    : getDefaultOrderType(business)

  const [orderType, setOrderType] = useState<OrderType>(initialType)

  const getInitialDrafts = useCallback((): OrderDrafts => {
    if (prototypeMode && prototypeState !== "empty") {
      return { ...(mockDrafts[business] as OrderDrafts) }
    }
    return { dry: {}, chilled: {}, products: {} }
  }, [business, prototypeMode, prototypeState])

  const [drafts, setDrafts] = useState<OrderDrafts>(getInitialDrafts)

  const currentQuantities = useMemo(() => {
    return (drafts[orderType] as Record<string, number>) || {}
  }, [drafts, orderType])

  const setItemQuantity = useCallback((productId: string, quantity: number) => {
    setDrafts((prev) => ({
      ...prev,
      [orderType]: {
        ...(prev[orderType] || {}),
        [productId]: Math.max(0, quantity),
      },
    }))
  }, [orderType])

  const incrementItem = useCallback((productId: string, step = 1) => {
    setDrafts((prev) => {
      const current = (prev[orderType] && prev[orderType][productId]) || 0
      return {
        ...prev,
        [orderType]: {
          ...(prev[orderType] || {}),
          [productId]: current + step,
        },
      }
    })
  }, [orderType])

  const decrementItem = useCallback((productId: string, step = 1) => {
    setDrafts((prev) => {
      const current = (prev[orderType] && prev[orderType][productId]) || 0
      const next = Math.max(0, current - step)
      return {
        ...prev,
        [orderType]: {
          ...(prev[orderType] || {}),
          [productId]: next,
        },
      }
    })
  }, [orderType])

  const resetDrafts = useCallback((newBusiness?: "fresh" | "style" | "tech") => {
    const b = newBusiness || business
    if (prototypeMode && prototypeState !== "empty") {
      setDrafts({ ...(mockDrafts[b] as OrderDrafts) })
    } else {
      setDrafts({ dry: {}, chilled: {}, products: {} })
    }
    setOrderType(getDefaultOrderType(b))
  }, [business, prototypeMode, prototypeState])

  return {
    orderType,
    setOrderType,
    drafts,
    setDrafts,
    currentQuantities,
    setItemQuantity,
    incrementItem,
    decrementItem,
    resetDrafts,
  }
}
