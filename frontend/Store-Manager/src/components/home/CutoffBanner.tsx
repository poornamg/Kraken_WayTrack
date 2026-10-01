import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { AlertTriangle, Clock3 } from "lucide-react"
import { calmSpring } from "../../constants/springs"

export function CutoffBanner({ closed = false }: { closed?: boolean }) {
  return (
    <motion.div
      className={`cutoff-banner ${closed ? "cutoff-banner--closed" : ""}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={calmSpring}
    >
      <span className="banner-icon">
        {closed ? <AlertTriangle /> : <Clock3 />}
      </span>
      <div>
        <strong>
          {closed ? "Next-day ordering closed" : "2h 14m until next-day cutoff"}
        </strong>
        <p>
          {closed
            ? "Orders submitted now will enter the following planning run."
            : "Orders submitted before 4:00 PM can enter tomorrow’s planning run."}
        </p>
      </div>
    </motion.div>
  )
}


