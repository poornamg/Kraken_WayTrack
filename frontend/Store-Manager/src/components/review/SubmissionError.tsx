import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { AlertTriangle } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { Button } from "../ui/Button"

export function SubmissionError({
  onRetry,
  onBack,
}: {
  onRetry: () => void
  onBack: () => void
}) {
  return (
    <motion.div
      className="submission-error"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={calmSpring}
    >
      <span className="submission-error-icon">
        <AlertTriangle />
      </span>
      <div>
        <strong>We couldn’t submit this order.</strong>
        <p>Your selections are still saved.</p>
      </div>
      <div className="submission-error-actions">
        <Button onClick={onRetry}>Try again</Button>
        <Button tone="secondary" onClick={onBack}>
          Back to edit
        </Button>
      </div>
    </motion.div>
  )
}


