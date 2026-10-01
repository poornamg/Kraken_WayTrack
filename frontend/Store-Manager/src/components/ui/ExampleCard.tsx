import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"

export function ExampleCard({
  title,
  caption,
  children,
  wide = false,
}: {
  title: string
  caption?: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className={`example-card ${wide ? "example-card--wide" : ""}`}>
      <div className="example-card-header">
        <span>{title}</span>
        {caption && <small>{caption}</small>}
      </div>
      <div className="example-card-content">{children}</div>
    </div>
  )
}


