import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import type { OrderType } from "../../types/index"
import { formatOutlet, formatOrderType, getDefaultOrderType } from "../../utils/index"

export function ReviewContext({ business, 
  type,
  afterCutoff,

}: { business: "fresh" | "style" | "tech", type: OrderType, afterCutoff: boolean

}) {
  return (
    <div className="review-context">
      <div>
        <span>Store</span>
        <strong>{formatOutlet(business)}</strong>
      </div>
      <div>
        <strong>{formatOrderType(business || "fresh", getDefaultOrderType(business || "fresh"))}</strong>

      </div>
      <div>
        <span>
          {afterCutoff ? "Following planning run" : "Target delivery"}
        </span>
        <strong>
          {afterCutoff ? "Friday, 2 October" : "Tomorrow · Thursday, 1 October"}
        </strong>
      </div>
      <div>
        <span>Cutoff</span>
        <strong>
          {afterCutoff ? "Next-day ordering closed" : "2h 14m remaining"}
        </strong>
      </div>
    </div>
  )
}


