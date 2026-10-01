import { ReceiptText } from "lucide-react"

export function AwaitingContent() {
  return (
    <>
      <span className="order-hero-icon">
        <ReceiptText />
      </span>
      <div className="order-hero-copy">
        <span className="field-label">Action required</span>
        <div className="order-hero-title">Delivery awaiting confirmation</div>
        <p>Driver completed delivery at 06:52. Confirm what arrived at the store.</p>
      </div>
    </>
  )
}
