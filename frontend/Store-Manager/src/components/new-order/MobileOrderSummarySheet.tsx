import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { ArrowRight, X } from "lucide-react"
import { overlaySpring } from "../../constants/springs"
import { Button, IconButton } from "../ui/Button"
import { SummaryItems } from ".//SummaryItems"
import type { OrderType, CatalogProduct } from "../../types/index"
import { formatOrderType, getDefaultOrderType } from "../../utils/index"

export function MobileOrderSummarySheet({ business,
  type,
  items,
  totalUnits,
  onClose,
  onReview,
}: {
  type: OrderType
  items: Array<CatalogProduct & { quantity: number }>
  totalUnits: number
  onClose: () => void
  onReview: () => void; business?: "fresh" | "style" | "tech"
}) {
  return (
    <motion.div
      className="sheet-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bottom-sheet order-summary-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-summary-sheet-title"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={overlaySpring}
      >
        <span className="sheet-handle" />
        <div className="sheet-header">
          <div>
            <span className="dialog-title" id="order-summary-sheet-title">
              Order summary
            </span>
            <p>
              {formatOrderType(business || "fresh", getDefaultOrderType(business || "fresh"))} ·{" "}
              {items.length} products · {totalUnits} units
            </p>
          </div>
          <IconButton label="Close order summary" onClick={onClose}>
            <X />
          </IconButton>
        </div>
        <SummaryItems items={items} />
        <div className="sheet-summary-actions">
          <Button size="mobile" onClick={onReview}>
            Review order
            <ArrowRight />
          </Button>
          <Button size="mobile" tone="secondary" onClick={onClose}>
            Continue editing
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}


