import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { StatusPill } from ".//StatusPill"
import { formatOrderType, getDefaultOrderType } from "../../utils/index"

export function DeliveryCard({ business = "fresh" }: { business?: "fresh" | "style" | "tech" }) {
  return (
    <div className="delivery-card">
      <div className="delivery-card-top">
        <div>
          <span className="data-id">ORD-1045</span>
          <div className="card-title">{formatOrderType(business || "fresh", getDefaultOrderType(business || "fresh"))}</div>
        </div>
        <StatusPill kind="transit" />
      </div>
      <div className="delivery-details">
        <div>
          <span className="field-label">Expected arrival</span>
          <strong className="eta-inline">06:40–07:00</strong>
        </div>
        <div>
          <span className="field-label">Target date</span>
          <strong>Wed, 30 Sep</strong>
        </div>
      </div>
    </div>
  )
}


