import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { calmSpring } from "../../constants/springs"
import type { StatusKind } from "../../types/index"
import { statusDetails } from "../../types/index"

export function StatusPill({ kind }: { kind: StatusKind }) {
  const status = statusDetails[kind]
  return (
    <motion.span
      className={`status-pill status-pill--${kind}`}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={calmSpring}
    >
      {status.icon}
      {status.label}
    </motion.span>
  )
}



