import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { AlertTriangle, CalendarDays, PackageCheck, ReceiptText, Truck, KeyRound } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { Button } from "../ui/Button"
import type { OrderDetailState } from "../../types/index"

export function OrderDetailHero({ onConfirmArrived, state, onReviewDelivery, pin = "4827", eta = "06:40–07:00",
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
      {state === "deferred" && (
        <>
          <span className="order-hero-icon" style={{ background: "var(--sunburst-50)", color: "var(--sunburst-600)" }}>
            <CalendarDays />
          </span>
          <div className="order-hero-copy">
            <span className="field-label">Current state</span>
            <div className="order-hero-title">Deferred</div>
            <p>This order has been moved to the next planning cycle.</p>
          </div>
          <div className="planning-facts">
            <span>
              <small>Target planning run</small>
              <strong>Friday, 2 October</strong>
            </span>
            <span>
              <small>Expected arrival</small>
              <strong>Not available yet</strong>
            </span>
          </div>
        </>
      )}

      {state === "confirmed" && (
        <>
          <span className="order-hero-icon">
            <PackageCheck />
          </span>
          <div className="order-hero-copy">
            <span className="field-label">Current state</span>
            <div className="order-hero-title">Order received successfully</div>
            <p>This order is waiting for delivery planning.</p>
          </div>
          <div className="planning-facts">
            <span>
              <small>Target planning run</small>
              <strong>Thursday, 1 October</strong>
            </span>
            <span>
              <small>Expected arrival</small>
              <strong>Not available yet</strong>
            </span>
          </div>
        </>
      )}

      {(state === "scheduled" || state === "on-way") && (
        <>
          <span className="order-hero-icon">
            <Truck />
          </span>
          <div className="order-hero-copy">
            <span className="field-label">Expected arrival</span>
            <div className="tracking-eta">{eta}</div>
            <p>
              {state === "on-way"
                ? "Vehicle departed at 05:48 · On schedule"
                : "Thursday, 1 October · Please have receiving staff ready."}
            </p>
          </div>
        </>
      )}
      {state === "arrived" && (
        <>
          <span className="order-hero-icon" style={{ background: "var(--indigo-50)", color: "var(--indigo-600)" }}>
            <KeyRound />
          </span>
          <div className="order-hero-copy" style={{ minWidth: 0, paddingRight: "var(--space-3)" }}>
            <span className="field-label">Delivery verification</span>
            <div className="order-hero-title">Verify delivery arrival</div>
            <p style={{ marginTop: 4, marginBottom: 16 }}>Give this 4-digit code to the driver to verify the delivery.</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(pin || "4827").split("").map((num, i) => (
                <div key={i} style={{ width: 48, height: 56, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, border: "1px solid var(--border)", borderRadius: 6, color: "var(--navy-900)", background: "var(--navy-50)" }}>{num}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13, color: "var(--text-primary)", fontWeight: 500, marginBottom: 8, flexWrap: "wrap" }}>
              <span>ORD-1082</span>
              <span style={{ color: "var(--text-tertiary)" }}>•</span>
              <span>WP-014</span>
              <span style={{ color: "var(--text-tertiary)" }}>•</span>
              <span>PLG-03</span>
              <span style={{ color: "var(--text-tertiary)" }}>•</span>
              <span>Arrived 06:43</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Note: Only share this code with the driver handling this delivery.</p>
          </div>
          <div className="arrived-action-panel">
            <div>
              <div style={{ fontWeight: 600, color: "var(--navy-900)", marginBottom: 4 }}>Delivery at your store?</div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4, marginBottom: 12 }}>Confirm after the vehicle has arrived and the driver has verified the code.</p>
            </div>
            <Button onClick={onConfirmArrived} className="full-width-btn">
              Confirm delivery arrived
            </Button>
          </div>
        </>
      )}
      {state === "awaiting-confirmation" && (
        <>
          <span className="order-hero-icon">
            <ReceiptText />
          </span>
          <div className="order-hero-copy">
            <span className="field-label">Action required</span>
            <div className="order-hero-title">
              Delivery awaiting confirmation
            </div>
            <p>
              Driver completed delivery at 06:52. Confirm what arrived at the
              store.
            </p>
          </div>
        </>
      )}

      {(state === "receipt-confirmed" || state === "receipt-issue") && (
        <>
          <span className="order-hero-icon">
            {state === "receipt-confirmed" ? (
              <PackageCheck />
            ) : (
              <AlertTriangle />
            )}
          </span>
          <div className="order-hero-copy">
            <span className="field-label">Store receipt</span>
            <div className="order-hero-title">
              {state === "receipt-confirmed"
                ? "Receipt confirmed"
                : "Receipt confirmed with issue"}
            </div>
            <p>
              {state === "receipt-confirmed"
                ? "The store confirmed all 4 products at 06:57."
                : "The store recorded missing and damaged goods at 06:59."}
            </p>
          </div>
        </>
      )}

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



