import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, PackageCheck, PackageOpen, Search } from "lucide-react"
import { calmSpring } from "../constants/springs"
import { Button } from "../components/ui/Button"
import { StatusPill } from "../components/ui/StatusPill"
import { PrototypeStateControl } from "../components/order-detail/PrototypeStateControl"
import { ReceiptReadOnlySummary } from "../components/receipt/ReceiptReadOnlySummary"
import { ReceiptGoodRows } from "../components/receipt/ReceiptGoodRows"
import { ReceiptIssueRow } from "../components/receipt/ReceiptIssueRow"
import { ReceiptConfirmationState } from "../components/receipt/ReceiptConfirmationState"
import type { ReceiptFlowState, ReceiptIssueType } from "../types/index"
import { mockDrafts } from "../types/index"
import { formatOrderType, getDefaultOrderType, selectedProducts } from "../utils/index"
import { getDraft } from "../data/mockData"

export function ReceiptFlowPage({ 
  business,
  state,
  onStateChange,
  onBack,
  onHome,
  onViewOrder,
  onBusinessChange,
}: {
  orderId?: string
  business: "fresh" | "style" | "tech"
  state: ReceiptFlowState
  onStateChange: (state: ReceiptFlowState) => void
  onBack: () => void
  onHome: () => void
  onViewOrder: (withIssue: boolean) => void
    onOpenOrder: (id: string, view: string, state: string) => void
    onBusinessChange?: (b: "fresh" | "style" | "tech") => void
}) {
  const receiptProducts = selectedProducts(business, getDefaultOrderType(business || "fresh"), getDraft(mockDrafts[business], getDefaultOrderType(business || "fresh")))
  const [received, setReceived] = useState<Record<string, number>>({
    rice: 20,
    "milk-powder": 28,
    flour: 10,
    "cooking-oil": 20,
  })
  const [issueTypes, setIssueTypes] =
    useState<Record<string, ReceiptIssueType>>({
      rice: "good",
      "milk-powder": "missing",
      flour: "good",
      "cooking-oil": "damaged",
    })
  const [damaged, setDamaged] = useState<Record<string, number>>({
    "cooking-oil": 1,
  })
  const [issueSearch, setIssueSearch] = useState("")
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null)
  const [remark, setRemark] = useState(
    "One bottle was damaged during unloading.",
  )
  const [photoAdded, setPhotoAdded] = useState(false)
  const stateOptions: Array<{
    value: ReceiptFlowState
    label: string
  }> = [
    { value: "verify", label: "Verify" },
    { value: "full", label: "Full receipt" },
    { value: "issue-edit", label: "Issue editing" },
    { value: "issue-review", label: "Issue review" },
    { value: "confirmed", label: "Receipt confirmed" },
    { value: "confirmed-issue", label: "Receipt confirmed with issue" },
  ]
  const success = state === "confirmed" || state === "confirmed-issue"

  return (
    <div className="receipt-flow-page">
      <div className="order-detail-utility-row">
        <button className="order-back-link" type="button" onClick={onBack}>
          <ArrowLeft />
          Back to order
        </button>
        <PrototypeStateControl
          value={state}
          options={stateOptions}
          onChange={onStateChange}
        />
      </div>

      {!success && (
        <div className="receipt-page-header">
          <div>
            <span className="page-kicker">ORD-1082 · {formatOrderType(business || "fresh", getDefaultOrderType(business || "fresh"))}</span>
            <div className="page-title">
              {state === "verify"
                ? "Verify delivery"
                : state === "full"
                  ? "Confirm full receipt"
                  : state === "issue-review"
                    ? "Review delivery issues"
                    : "Verify delivery issues"}
            </div>
            <p>Driver completed delivery at 06:52.</p>
          </div>
          <StatusPill kind="awaiting" />
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {state === "verify" && (
          <motion.div
            className="receipt-initial-layout"
            key="verify"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={calmSpring}
          >
            <section className="verification-choice-card">
              <span className="verification-choice-icon">
                <PackageCheck />
              </span>
              <div className="verification-choice-title">
                Did everything arrive as expected?
              </div>
              <p>
                Choose the full-receipt path when all products and quantities
                are correct.
              </p>
              <div className="verification-choice-actions">
                <Button
                  icon={<CheckCircle2 />}
                  onClick={() => onStateChange("full")}
                >
                  Yes, everything is correct
                </Button>
                <Button
                  tone="secondary"
                  icon={<AlertTriangle />}
                  onClick={() => onStateChange("issue-edit")}
                >
                  Something is missing or damaged
                </Button>
              </div>
            </section>
            <ReceiptReadOnlySummary business={business} />
          </motion.div>
        )}

        {state === "full" && (
          <motion.div
            className="receipt-review-layout"
            key="full"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={calmSpring}
          >
            <section className="receipt-review-panel">
              <div className="receipt-panel-heading">
                <div>
                  <span>Full receipt</span>
                  <small>All ordered quantities will be confirmed.</small>
                </div>
              </div>
              <ReceiptGoodRows business={business} />
            </section>
            <aside className="receipt-commit-panel">
              <CheckCircle2 />
              <strong>Everything matches the order</strong>
              <p>No remark or photo is required.</p>
              <Button onClick={() => onStateChange("confirmed")}>
                Confirm full receipt
              </Button>
              <Button tone="secondary" onClick={() => onStateChange("verify")}>
                Back
              </Button>
            </aside>
          </motion.div>
        )}

        {state === "issue-edit" && (
          <motion.div
            className="receipt-issue-editor"
            key="issue-edit"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={calmSpring}
          >
                        <div style={{ padding: "16px 24px 0", borderBottom: "1px solid var(--border)" }}>
               <label className="field">
                 <span className="input-wrap input-wrap--icon">
                   <Search />
                   <input
                     placeholder="Search products"
                     value={issueSearch}
                     onChange={(e) => setIssueSearch(e.target.value)}
                   />
                 </span>
               </label>
            </div>
            <div className="receipt-issue-list">
              {receiptProducts.filter(p => p.name.toLowerCase().includes(issueSearch.toLowerCase())).map((product) => (
                <ReceiptIssueRow
                  key={product.id}
                  business={business}
                  product={product}
                  received={received[product.id] ?? product.quantity}
                  issueType={issueTypes[product.id] ?? "good"}
                  damaged={damaged[product.id] ?? 0}
                  isExpanded={expandedIssueId === product.id}
                  onToggle={() => setExpandedIssueId((current: string | null) => current === product.id ? null : product.id)}
                  onReceivedChange={(quantity) =>
                    setReceived((current) => ({
                      ...current,
                      [product.id]: quantity,
                    }))
                  }
                  onIssueChange={(value) =>
                    setIssueTypes((current) => ({
                      ...current,
                      [product.id]: value,
                    }))
                  }
                  onDamagedChange={(quantity) =>
                    setDamaged((current) => ({
                      ...current,
                      [product.id]: quantity,
                    }))
                  }
                />
              ))}
            </div>

            <div className="receipt-evidence-card">
              <label className="field">
                <span className="field-label">Add remark · Optional</span>
                <textarea
                  value={remark}
                  placeholder="Describe anything the structured fields do not cover"
                  onChange={(event) => setRemark(event.target.value)}
                />
              </label>
              <div className="photo-field">
                <span className="field-label">Photo · Optional</span>
                <Button
                  tone="secondary"
                  onClick={() => setPhotoAdded((current) => !current)}
                >
                  {photoAdded ? "Remove photo" : "Add photo"}
                </Button>
                <AnimatePresence>
                  {photoAdded && (
                    <motion.div
                      className="photo-preview"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      <PackageOpen />
                      <span>
                        <strong>delivery-issue.jpg</strong>
                        <small>Photo attached</small>
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="receipt-editor-actions">
                <Button onClick={() => onStateChange("issue-review")}>
                  Review issues
                  <ArrowRight />
                </Button>
                <Button
                  tone="secondary"
                  onClick={() => onStateChange("verify")}
                >
                  Back
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {state === "issue-review" && (
          <motion.div
            className="issue-review-layout"
            key="issue-review"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={calmSpring}
          >
            <section className="issue-review-card">
              <div className="receipt-panel-heading">
                <div>
                  <span>Reported issues</span>
                  <small>Review before confirming the store receipt.</small>
                </div>
              </div>
              <div className="issue-review-items">
                <div>
                  <strong>Milk powder</strong>
                  <span>Ordered: 30 cartons</span>
                  <span>Received: {received["milk-powder"]} cartons</span>
                  <b>{30 - received["milk-powder"]} cartons missing</b>
                </div>
                <div>
                  <strong>Cooking oil</strong>
                  <span>Ordered: 20 bottles</span>
                  <span>Received: {received["cooking-oil"]} bottles</span>
                  <b>{damaged["cooking-oil"]} bottle damaged</b>
                </div>
              </div>
              {remark && (
                <div className="issue-review-remark">
                  <span>Remark</span>
                  <p>{remark}</p>
                </div>
              )}
            </section>
            <aside className="receipt-commit-panel receipt-commit-panel--issue">
              <AlertTriangle />
              <strong>Confirm receipt with issue</strong>
              <p>The issue record will be sent to the dispatcher for review.</p>
              <Button onClick={() => onStateChange("confirmed-issue")}>
                Confirm receipt with issue
              </Button>
              <Button
                tone="secondary"
                onClick={() => onStateChange("issue-edit")}
              >
                Back to edit
              </Button>
            </aside>
          </motion.div>
        )}

        {state === "confirmed" && (
          <ReceiptConfirmationState
            key="confirmed"
            withIssue={false}
            onViewOrder={() => onViewOrder(false)}
            onHome={onHome}
          />
        )}

        {state === "confirmed-issue" && (
          <ReceiptConfirmationState
            key="confirmed-issue"
            withIssue
            onViewOrder={() => onViewOrder(true)}
            onHome={onHome}
          />
        )}
      </AnimatePresence>
    </div>
  )
}



