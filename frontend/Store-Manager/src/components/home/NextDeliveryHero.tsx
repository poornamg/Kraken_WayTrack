import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { ArrowRight, CalendarDays } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { Button } from "../ui/Button"
import { StatusPill } from "../ui/StatusPill"
import { formatOrderType, getDefaultOrderType } from "../../utils/index"

export function NextDeliveryHero({ onOpen, business = "fresh" }: { onOpen?: () => void, business?: "fresh" | "style" | "tech" }) {
  return (
    <motion.div
      className="next-delivery-card"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={calmSpring}
    >
      <div className="next-delivery-main">
        <div className="next-delivery-heading">
          <span className="delivery-date">
            <CalendarDays />
            Tomorrow · Thursday, 1 October
          </span>
          <StatusPill kind="scheduled" />
        </div>
        <div className="delivery-name">{formatOrderType(business || "fresh", getDefaultOrderType(business || "fresh"))}</div>
        <span className="order-reference">
          Order <strong className="data-id">ORD-1062</strong>
        </span>
      </div>

      <div className="next-delivery-eta">
        <span className="field-label">Expected arrival</span>
        <strong>06:40–07:00</strong>
        <span>Tomorrow morning</span>
      </div>

      <div className="next-delivery-meta">
        <div>
          <span>Trip</span>
          <strong className="data-id">PLG-03</strong>
        </div>
        <div>
          <span>Vehicle</span>
          <strong className="data-id">WP-014</strong>
        </div>
      </div>

      <Button tone="secondary" className="view-details-button" onClick={onOpen}>
        View details
        <ArrowRight />
      </Button>
    </motion.div>
  )
}




