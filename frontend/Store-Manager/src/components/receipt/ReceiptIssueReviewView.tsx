import { motion } from "motion/react"
import { AlertTriangle } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { Button } from "../ui/Button"
import type { ReceiptFlowState } from "../../types"

export function ReceiptIssueReviewView({
  received,
  damaged,
  remark,
  onStateChange,
}: {
  received: Record<string, number>
  damaged: Record<string, number>
  remark: string
  onStateChange: (state: ReceiptFlowState) => void
}) {
  return (
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
  )
}
