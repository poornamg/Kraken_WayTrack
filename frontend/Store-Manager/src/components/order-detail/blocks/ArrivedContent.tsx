import { KeyRound } from "lucide-react"
import { Button } from "../../ui/Button"
import { PinCard } from "../PinCard"

export function ArrivedContent({
  pin = "4827",
  onConfirmArrived,
}: {
  pin?: string
  onConfirmArrived: () => void
}) {
  return (
    <>
      <span
        className="order-hero-icon"
        style={{ background: "var(--indigo-50)", color: "var(--indigo-600)" }}
      >
        <KeyRound />
      </span>
      <div
        className="order-hero-copy"
        style={{ minWidth: 0, paddingRight: "var(--space-3)" }}
      >
        <span className="field-label">Delivery verification</span>
        <div className="order-hero-title">Verify delivery arrival</div>
        <p style={{ marginTop: 4, marginBottom: 16 }}>
          Give this 4-digit code to the driver to verify the delivery.
        </p>
        <PinCard pin={pin} />
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            fontSize: 13,
            color: "var(--text-primary)",
            fontWeight: 500,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <span>ORD-1082</span>
          <span style={{ color: "var(--text-tertiary)" }}>•</span>
          <span>WP-014</span>
          <span style={{ color: "var(--text-tertiary)" }}>•</span>
          <span>PLG-03</span>
          <span style={{ color: "var(--text-tertiary)" }}>•</span>
          <span>Arrived 06:43</span>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
          Note: Only share this code with the driver handling this delivery.
        </p>
      </div>
      <div className="arrived-action-panel">
        <div>
          <div
            style={{
              fontWeight: 600,
              color: "var(--navy-900)",
              marginBottom: 4,
            }}
          >
            Delivery at your store?
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.4,
              marginBottom: 12,
            }}
          >
            Confirm after the vehicle has arrived and the driver has verified the code.
          </p>
        </div>
        <Button onClick={onConfirmArrived} className="full-width-btn">
          Confirm delivery arrived
        </Button>
      </div>
    </>
  )
}
