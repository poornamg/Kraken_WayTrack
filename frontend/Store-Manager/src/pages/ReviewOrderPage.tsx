import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { Check, Clock3, LoaderCircle } from "lucide-react"
import { submitStoreOrder } from "../services/store"
import { Button } from "../components/ui/Button"
import { ReviewContext } from "../components/review/ReviewContext"
import { ReviewProductList } from "../components/review/ReviewProductList"
import { SubmissionError } from "../components/review/SubmissionError"
import type { OrderType, OrderDrafts, SubmissionState } from "../types/index"
import { formatOrderType, getDefaultOrderType, selectedProducts } from "../utils/index"
import { getDraft } from "../data/mockData"

export function ReviewOrderPage({ business, 
  type,
  quantities,
  afterCutoff,
  forceError,
  onBack,
  onConfirmed,
}: { business: "fresh" | "style" | "tech"
  type: OrderType
  quantities: OrderDrafts
  afterCutoff: boolean
  forceError: boolean
  onBack: () => void
  onConfirmed: () => void
}) {
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle")
  const items = selectedProducts(business, type, getDraft(quantities, type))
  const totalUnits = items.reduce((total, item) => total + item.quantity, 0)

  async function submitOrder() {
    setSubmissionState("submitting")
    if (forceError) { setSubmissionState("error"); return }
    try {
      await submitStoreOrder({ business, type, items: items.map((item) => ({ id: item.id, quantity: item.quantity })) })
      onConfirmed()
    } catch (error) {
      console.error("Order submission failed", error)
      setSubmissionState("error")
    }
  }

  return (
    <div className="review-order-page">
      <div className="review-page-header">
        <div>
          <span className="page-kicker">Store order</span>
          <div className="page-title">Review order</div>
          <p>Check your order before submitting.</p>
        </div>
      </div>

      <ReviewContext business={business} type={type} afterCutoff={afterCutoff} />

      <div className="review-layout">
        <section className="review-products-panel">
          <div className="review-panel-heading">
            <div>
              <span>Selected products</span>
              <small>Confirm each quantity before submitting.</small>
            </div>
            <Button tone="secondary" className="text-button" onClick={onBack}>
              Edit products
            </Button>
          </div>
          <ReviewProductList items={items} />
        </section>

        <aside className="review-commit-panel">
          <div className="review-commit-heading">Ready to submit?</div>
          <p>
            WayLink will receive this{" "}
            {formatOrderType(business || "fresh", getDefaultOrderType(business || "fresh")).toLowerCase()} order for
            delivery planning.
          </p>

          <div
            className={`review-cutoff-note ${
              afterCutoff ? "review-cutoff-note--closed" : ""
            }`}
          >
            <Clock3 />
            <div>
              <strong>
                {afterCutoff
                  ? "Next-day ordering closed"
                  : "Submit before 4:00 PM"}
              </strong>
              <span>
                {afterCutoff
                  ? "Orders submitted now will enter Friday’s planning run."
                  : "Enter tomorrow’s planning queue."}
              </span>
            </div>
          </div>

          <div className="review-commit-total">
            <span>{items.length} products</span>
            <strong>{totalUnits} total units</strong>
          </div>

          <div className="review-actions">
            <Button
              onClick={submitOrder}
              disabled={submissionState === "submitting"}
            >
              {submissionState === "submitting" ? (
                <>
                  <LoaderCircle className="loading-icon" />
                  Submitting order…
                </>
              ) : (
                "Submit order"
              )}
            </Button>
            <Button
              tone="secondary"
              onClick={onBack}
              disabled={submissionState === "submitting"}
            >
              Back to edit
            </Button>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {submissionState === "error" && (
          <SubmissionError onRetry={submitOrder} onBack={onBack} />
        )}
      </AnimatePresence>

      <div className="mobile-review-actions">
        <Button
          tone="secondary"
          size="mobile"
          onClick={onBack}
          disabled={submissionState === "submitting"}
        >
          Edit
        </Button>
        <Button
          size="mobile"
          onClick={submitOrder}
          disabled={submissionState === "submitting"}
        >
          {submissionState === "submitting" ? (
            <>
              <LoaderCircle className="loading-icon" />
              Submitting…
            </>
          ) : (
            "Submit order"
          )}
        </Button>
      </div>
    </div>
  )
}


