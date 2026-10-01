import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { ArrowRight, PackageOpen } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { Button } from "../ui/Button"
import { SummaryItems } from ".//SummaryItems"
import type { OrderType, CatalogProduct } from "../../types/index"
import { formatOrderType, getDefaultOrderType } from "../../utils/index"

export function DesktopOrderSummary({ business,
  type,
  items,
  totalUnits,
  onClear,
  afterCutoff,
  onReview,
}: {
  type: OrderType
  items: Array<CatalogProduct & { quantity: number }>
  totalUnits: number
  onClear: () => void
  afterCutoff: boolean
  onReview: () => void; business?: "fresh" | "style" | "tech"
}) {
  const populated = items.length > 0
  return (
    <motion.aside
      className="order-summary-panel"
      layout
      transition={calmSpring}
    >
      <div className="order-summary-heading">Order summary</div>
      <div className="summary-context">
        <span>
          <small>Order type</small>
          <strong>
            {formatOrderType(business || "fresh", getDefaultOrderType(business || "fresh"))}
          </strong>
        </span>
        <span>
          <small>{afterCutoff ? "Planning run" : "Target delivery"}</small>
          <strong>
            {afterCutoff ? "Friday, 2 October" : "Thursday, 1 October"}
          </strong>
        </span>
      </div>

      <AnimatePresence mode="wait">
        {populated ? (
          <motion.div
            key="populated"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={calmSpring}
          >
            <div className="summary-totals">
              <span>
                <strong>{items.length}</strong>
                <small>products selected</small>
              </span>
              <span>
                <strong>{totalUnits}</strong>
                <small>total units</small>
              </span>
            </div>
            <SummaryItems items={items} />
          </motion.div>
        ) : (
          <motion.div
            className="empty-summary"
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={calmSpring}
          >
            <PackageOpen />
            <strong>No products selected yet</strong>
            <p>Add a quantity to include a product in this order.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="summary-actions">
        <Button disabled={!populated} onClick={onReview}>
          Review order
          <ArrowRight />
        </Button>
        <Button tone="secondary" disabled={!populated} onClick={onClear}>
          Clear order
        </Button>
      </div>
    </motion.aside>
  )
}


