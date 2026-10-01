import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AlertTriangle, Check, PackageOpen } from "lucide-react"

export function VerificationRow({
  state,
  received,
}: {
  state: "good" | "missing" | "damaged"
  received: number
}) {
  const statusLabel =
    state === "good" ? "Good" : state === "missing" ? "2 missing" : "1 damaged"
  return (
    <div className="verification-row">
      <span className="product-icon product-icon--small">
        <PackageOpen />
      </span>
      <div className="verification-name">
        <strong>Milk</strong>
        <small>Ordered: 30 cartons</small>
      </div>
      <div className="verification-received">
        <span>Received</span>
        <strong>{received} cartons</strong>
      </div>
      <span className={`verification-status verification-status--${state}`}>
        {state === "good" ? <Check /> : <AlertTriangle />}
        {statusLabel}
      </span>
    </div>
  )
}


