import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { AlertTriangle, ArrowRight, Check, Home } from "lucide-react"
import { overlaySpring } from "../../constants/springs"
import { Button } from "../ui/Button"
import { StatusPill } from "../ui/StatusPill"

export function ReceiptConfirmationState({
  orderId = "ORD-1082",
  withIssue,
  onViewOrder,
  onHome,
}: {
  orderId?: string
  withIssue: boolean
  onViewOrder: () => void
  onHome: () => void
}) {
  return (
    <motion.div
      className="receipt-confirmation-state"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={overlaySpring}
    >
      <span
        className={`receipt-success-icon ${
          withIssue ? "receipt-success-icon--issue" : ""
        }`}
      >
        {withIssue ? <AlertTriangle /> : <Check />}
      </span>
      <div className="receipt-confirmation-title">
        {withIssue ? "Receipt recorded" : "Receipt confirmed"}
      </div>
      <p>
        {withIssue
          ? "Your delivery receipt and reported issues have been saved."
          : orderId + " has been confirmed as fully received."}
      </p>

      <div className="receipt-confirmation-card">
        <div className="receipt-confirmation-order">
          <span className="data-id">{orderId}</span>
          <StatusPill kind={withIssue ? "issue" : "received"} />
        </div>
        <div className="receipt-confirmation-facts">
          {withIssue ? (
            <>
              <span>
                <strong>2 cartons</strong>
                <small>missing</small>
              </span>
              <span>
                <strong>1 bottle</strong>
                <small>damaged</small>
              </span>
              <span>
                <strong>06:59</strong>
                <small>recorded</small>
              </span>
            </>
          ) : (
            <>
              <span>
                <strong>4 products</strong>
                <small>received</small>
              </span>
              <span>
                <strong>80 units</strong>
                <small>confirmed</small>
              </span>
              <span>
                <strong>06:57</strong>
                <small>confirmed</small>
              </span>
            </>
          )}
        </div>
        <div className="receipt-confirmation-message">
          {withIssue
            ? "The issue has been sent to the dispatcher for review."
            : "No issues reported."}
        </div>
      </div>

      <div className="receipt-confirmation-actions">
        <Button onClick={onViewOrder}>
          View order
          <ArrowRight />
        </Button>
        <Button tone="secondary" onClick={onHome}>
          Back to Home
        </Button>
      </div>
    </motion.div>
  )
}


