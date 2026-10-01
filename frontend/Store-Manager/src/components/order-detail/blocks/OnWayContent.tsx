import { Truck } from "lucide-react"

export function OnWayContent({ eta = "06:40–07:00" }: { eta?: string }) {
  return (
    <>
      <span className="order-hero-icon">
        <Truck />
      </span>
      <div className="order-hero-copy">
        <span className="field-label">Expected arrival</span>
        <div className="tracking-eta">{eta}</div>
        <p>Vehicle departed at 05:48 · On schedule</p>
      </div>
    </>
  )
}
