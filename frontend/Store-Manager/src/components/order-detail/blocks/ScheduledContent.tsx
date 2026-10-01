import { Truck } from "lucide-react"

export function ScheduledContent({ eta = "06:40–07:00" }: { eta?: string }) {
  return (
    <>
      <span className="order-hero-icon">
        <Truck />
      </span>
      <div className="order-hero-copy">
        <span className="field-label">Expected arrival</span>
        <div className="tracking-eta">{eta}</div>
        <p>Thursday, 1 October · Please have receiving staff ready.</p>
      </div>
    </>
  )
}
