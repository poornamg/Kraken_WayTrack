import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { Clock3 } from "lucide-react"
import { calmSpring } from "../../constants/springs"

export function GlobalCutoff({ closed = false, open, setOpen }: { closed?: boolean, open: boolean, setOpen: (v: boolean) => void }) {
  
  return (
    <div className="global-cutoff-container" style={{ position: "relative" }}>
      <button 
        className={`global-cutoff-pill ${closed ? "global-cutoff-pill--closed" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <Clock3 className="cutoff-icon" style={{ width: 14, height: 14 }} />
        <span className="cutoff-pill-text desktop-only">
          {closed ? "Next-day cutoff passed" : "Next-day cutoff · 2h 14m"}
        </span>
        <span className="cutoff-pill-text mobile-only">
          {closed ? "Cutoff passed" : "Cutoff · 2h 14m"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            className="global-cutoff-popover"
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={calmSpring}
          >
            <strong>{closed ? "Next-day order cutoff passed" : "Next-day order cutoff"}</strong>
            <p>{closed ? "Orders submitted now enter the following planning run." : "Submit before 4:00 PM for tomorrow's planning run."}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


