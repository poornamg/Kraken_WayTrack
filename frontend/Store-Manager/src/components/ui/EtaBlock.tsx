import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { Truck } from "lucide-react"

export function EtaBlock() {
  return (
    <div className="eta-block">
      <span className="eta-icon">
        <Truck />
      </span>
      <div>
        <span className="field-label">Expected arrival</span>
        <strong className="eta-time">06:40–07:00</strong>
        <span className="eta-date">Wednesday, 30 September</span>
      </div>
    </div>
  )
}


