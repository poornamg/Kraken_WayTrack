import { motion } from "motion/react"
import { CheckCircle2 } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { Button } from "../ui/Button"
import { ReceiptGoodRows } from "./ReceiptGoodRows"
import type { ReceiptFlowState } from "../../types"

export function ReceiptFullView({
  business,
  onStateChange,
}: {
  business: "fresh" | "style" | "tech"
  onStateChange: (state: ReceiptFlowState) => void
}) {
  return (
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
  )
}
