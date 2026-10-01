import { PackageCheck } from "lucide-react"

export function ReceiptConfirmedContent() {
  return (
    <>
      <span className="order-hero-icon">
        <PackageCheck />
      </span>
      <div className="order-hero-copy">
        <span className="field-label">Store receipt</span>
        <div className="order-hero-title">Receipt confirmed</div>
        <p>The store confirmed all 4 products at 06:57.</p>
      </div>
    </>
  )
}
