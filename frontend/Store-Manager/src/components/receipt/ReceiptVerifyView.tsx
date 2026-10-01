import { motion } from "motion/react"
import { AlertTriangle, CheckCircle2, PackageCheck } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { Button } from "../ui/Button"
import { ReceiptReadOnlySummary } from "./ReceiptReadOnlySummary"
import type { ReceiptFlowState } from "../../types"

export function ReceiptVerifyView({
  business,
  onStateChange,
}: {
  business: "fresh" | "style" | "tech"
  onStateChange: (state: ReceiptFlowState) => void
}) {
  return (
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
          Choose the full-receipt path when all products and quantities are
          correct.
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
  )
}
