import { motion } from "motion/react"
import { calmSpring } from "../../constants/springs"
import { Button } from "../ui/Button"
import type { OrderDetailState } from "../../types/index"
import {
  ConfirmedContent,
  DeferredContent,
  ScheduledContent,
  OnWayContent,
  ArrivedContent,
  AwaitingContent,
  ReceiptConfirmedContent,
  ReceiptIssueContent,
} from "./blocks"

export function OrderDetailHero({
  state,
  pin = "4827",
  eta = "06:40–07:00",
  onReviewDelivery,
  onConfirmArrived,
}: {
  state: OrderDetailState
  pin?: string
  eta?: string
  onReviewDelivery: () => void
  onConfirmArrived: () => void
}) {
  const showDeliveryMeta = state !== "confirmed" && state !== "arrived"

  return (
    <motion.div
      className={`order-detail-hero order-detail-hero--${state}`}
      key={state}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={calmSpring}
    >
      {state === "deferred" && <DeferredContent />}
      {state === "confirmed" && <ConfirmedContent />}
      {state === "scheduled" && <ScheduledContent eta={eta} />}
      {state === "on-way" && <OnWayContent eta={eta} />}
      {state === "arrived" && (
        <ArrivedContent pin={pin} onConfirmArrived={onConfirmArrived} />
      )}
      {state === "awaiting-confirmation" && <AwaitingContent />}
      {state === "receipt-confirmed" && <ReceiptConfirmedContent />}
      {state === "receipt-issue" && <ReceiptIssueContent />}

      {showDeliveryMeta && (
        <div className="tracking-meta">
          <span>
            <small>Trip</small>
            <strong className="data-id">PLG-03</strong>
          </span>
          <span>
            <small>Vehicle</small>
            <strong className="data-id">WP-014</strong>
          </span>
        </div>
      )}

      {state === "awaiting-confirmation" && (
        <Button className="order-hero-action" onClick={onReviewDelivery}>
          Review delivery
        </Button>
      )}
    </motion.div>
  )
}
