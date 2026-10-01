import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"

export function BrandMark({ compact = false, onClick }: { compact?: boolean, onClick?: () => void }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="brand-name">WayLink</span>
    </div>
  )
}


