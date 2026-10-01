import { AlertTriangle } from "lucide-react"

export function ReceiptIssueContent() {
  return (
    <>
      <span className="order-hero-icon">
        <AlertTriangle />
      </span>
      <div className="order-hero-copy">
        <span className="field-label">Store receipt</span>
        <div className="order-hero-title">Receipt confirmed with issue</div>
        <p>The store recorded missing and damaged goods at 06:59.</p>
      </div>
    </>
  )
}
