import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { AlertTriangle, ArrowRight, CalendarDays } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { StatusPill } from "../ui/StatusPill"
import type { UpcomingDelivery } from "../../types/index"

export function UpcomingDeliveryRow({ business, delivery, onOpen }: { business: "fresh" | "style" | "tech", delivery: UpcomingDelivery, onOpen?: () => void }) {
  return (
    <motion.button
      className="upcoming-row"
      type="button"
      layout
      onClick={onOpen}
      whileTap={{ scale: 0.99 }}
      transition={calmSpring}
    >
      <span className="upcoming-record">
        <strong className="data-id">{delivery.id}</strong>
        <span>{delivery.type}</span>
      </span>
      <span className="upcoming-date">
        <CalendarDays />
        {delivery.date}
      </span>
      <span className="upcoming-status">
        <StatusPill kind={delivery.status} />
        {delivery.reason && (
          <small>
            <AlertTriangle />
            {delivery.reason}
          </small>
        )}
      </span>
      <span className="upcoming-eta">{delivery.eta}</span>
      <ArrowRight className="row-arrow" />
    </motion.button>
  )
}



