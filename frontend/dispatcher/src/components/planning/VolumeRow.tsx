// src/components/planning/VolumeRow.tsx - Volume progress bar row for selected vehicle

import { ProgressBar } from "@/components/ui"
import { Vehicle } from "@/types"
import { vehicleDay } from "@/domain/constraints"

export function VolumeRow({ vehicle, used }: { vehicle: Vehicle; used: number }) {
  const total = vehicleDay(vehicle).volumeM3
  const percent = Math.round((used / total) * 100)
  return (
    <>
      <div className="selected-card__load selected-card__load--volume">
        <strong>
          Volume {used.toFixed(1)} / {total} m³
        </strong>
        <b>{percent}%</b>
      </div>
      <ProgressBar value={percent} warning={percent >= 90} />
    </>
  )
}
export default VolumeRow;
