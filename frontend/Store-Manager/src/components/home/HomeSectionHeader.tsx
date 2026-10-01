import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "../ui/Button"

export function HomeSectionHeader({
    title,
    action,
    onAction,
  }: {
    title: string
    action?: string
    onAction?: () => void
  }) {
  return (
    <div className="home-section-header">
      <div className="home-section-title">{title}</div>
      {action && (
        <Button tone="secondary" className="text-button" onClick={onAction}>
          {action}
          <ArrowRight />
        </Button>
      )}
    </div>
  )
}






