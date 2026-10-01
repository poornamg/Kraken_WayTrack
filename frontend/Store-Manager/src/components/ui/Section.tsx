import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { IconButton } from ".//Button"

export function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <section className="showcase-section">
      <div className="section-heading">
        <div className="section-heading-copy">
          <span className="eyebrow">{eyebrow}</span>
          <div className="section-title">{title}</div>
          {description && <p>{description}</p>}
        </div>
        <IconButton
          label={expanded ? `Collapse ${title}` : `Expand ${title}`}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </IconButton>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            className="section-body"
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            transition={calmSpring}
          >
            <div className="section-body-inner">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}


