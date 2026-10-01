import { useState } from "react"
import { AnimatePresence } from "motion/react"
import { ArrowLeft } from "lucide-react"
import { StatusPill } from "../components/ui/StatusPill"
import { PrototypeStateControl } from "../components/order-detail/PrototypeStateControl"
import {
  ReceiptVerifyView,
  ReceiptFullView,
  ReceiptIssueEditView,
  ReceiptIssueReviewView,
  ReceiptConfirmationState,
} from "../components/receipt"
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
}: {
  orderId?: string
  business: "fresh" | "style" | "tech"
  state: ReceiptFlowState
  onStateChange: (state: ReceiptFlowState) => void
  onBack: () => void
  onHome: () => void
  onViewOrder: (withIssue: boolean) => void
  onOpenOrder?: (id: string, view: string, state: string) => void
  onBusinessChange?: (b: "fresh" | "style" | "tech") => void
}) {
  const receiptProducts = selectedProducts(
    business,
    getDefaultOrderType(business || "fresh"),
    getDraft(mockDrafts[business], getDefaultOrderType(business || "fresh"))
  )

  const [received, setReceived] = useState<Record<string, number>>({
    rice: 20,
    "milk-powder": 28,
    flour: 10,
    "cooking-oil": 20,
  })

  const [issueTypes, setIssueTypes] = useState<Record<string, ReceiptIssueType>>({
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
  const [remark, setRemark] = useState("One bottle was damaged during unloading.")
  const [photoAdded, setPhotoAdded] = useState(false)

  const stateOptions: Array<{ value: ReceiptFlowState; label: string }> = [
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
            <span className="page-kicker">
              ORD-1082 · {formatOrderType(business || "fresh", getDefaultOrderType(business || "fresh"))}
            </span>
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
          <ReceiptVerifyView
            key="verify"
            business={business}
            onStateChange={onStateChange}
          />
        )}

        {state === "full" && (
          <ReceiptFullView
            key="full"
            business={business}
            onStateChange={onStateChange}
          />
        )}

        {state === "issue-edit" && (
          <ReceiptIssueEditView
            key="issue-edit"
            business={business}
            receiptProducts={receiptProducts}
            received={received}
            issueTypes={issueTypes}
            damaged={damaged}
            issueSearch={issueSearch}
            setIssueSearch={setIssueSearch}
            expandedIssueId={expandedIssueId}
            setExpandedIssueId={setExpandedIssueId}
            remark={remark}
            setRemark={setRemark}
            photoAdded={photoAdded}
            setPhotoAdded={setPhotoAdded}
            onReceivedChange={(id, qty) =>
              setReceived((curr) => ({ ...curr, [id]: qty }))
            }
            onIssueChange={(id, val) =>
              setIssueTypes((curr) => ({ ...curr, [id]: val }))
            }
            onDamagedChange={(id, qty) =>
              setDamaged((curr) => ({ ...curr, [id]: qty }))
            }
            onStateChange={onStateChange}
          />
        )}

        {state === "issue-review" && (
          <ReceiptIssueReviewView
            key="issue-review"
            received={received}
            damaged={damaged}
            remark={remark}
            onStateChange={onStateChange}
          />
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
