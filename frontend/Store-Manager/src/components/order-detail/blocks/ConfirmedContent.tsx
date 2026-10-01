import { PackageCheck } from "lucide-react"

export function ConfirmedContent() {
  return (
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
  )
}
