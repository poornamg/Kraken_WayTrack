// src/components/planning/TurnsToday.tsx - Turns today counter badge for vehicle

import { Vehicle } from "@/types"
import { DAILY_TURN_LIMIT } from "@/constants"
import { vehicleDay } from "@/domain/constraints"

export function TurnsToday({ vehicle }: { vehicle: Vehicle }) {
  const { turnsToday } = vehicleDay(vehicle)
  const full = turnsToday >= DAILY_TURN_LIMIT
  return (
    <span className={`turns-today ${full ? "turns-today--full" : ""}`}>
      Turns today {turnsToday} / {DAILY_TURN_LIMIT}
    </span>
  )
}
export default TurnsToday;
