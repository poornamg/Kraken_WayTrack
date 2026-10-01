// src/components/planning/VehicleGraphic.tsx - Graphical representation of vehicle icon and dimensions

import { Truck, Snowflake } from "lucide-react"
import { Vehicle } from "@/types"

export function VehicleGraphic({
  vehicle,
  large = false,
}: {
  vehicle: Vehicle
  large?: boolean
}) {
  return (
    <div className={`vehicle-graphic ${large ? "vehicle-graphic--large" : ""}`}>
      <Truck
        aria-hidden="true"
        size={large ? 88 : vehicle.capacityKg > 2500 ? 62 : 52}
        strokeWidth={1.7}
      />
      {vehicle.type === "Refrigerated" ? (
        <Snowflake
          className="vehicle-graphic__snow"
          aria-hidden="true"
          size={16}
        />
      ) : null}
      {large ? (
        <span className="vehicle-graphic__length">↔ {vehicle.length}</span>
      ) : null}
    </div>
  )
}
export default VehicleGraphic;
