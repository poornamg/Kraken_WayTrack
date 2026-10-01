import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { Box } from "lucide-react"

export function OutletIdentity({ business = "fresh" }: { business?: "fresh" | "style" | "tech" }) {
  return (
    <div className="outlet-identity">
      <span className="outlet-icon">
        <Box />
      </span>
      <span>
        <small className="outlet-label">Your outlet</small>
        <strong>{business === "style" ? "Waypoint Style" : business === "tech" ? "Waypoint Tech" : "Waypoint Fresh"}</strong>
        <small className="outlet-location">Kandy City</small>
      </span>
    </div>
  )
}


