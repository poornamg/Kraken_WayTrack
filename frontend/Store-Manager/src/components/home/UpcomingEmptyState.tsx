import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { CalendarDays } from "lucide-react"
import { calmSpring } from "../../constants/springs"

export function UpcomingEmptyState() {
  return (
    <motion.div
      className="upcoming-empty"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={calmSpring}
    >
      <CalendarDays />
      <div>
        <strong>No upcoming deliveries scheduled</strong>
        <p>New delivery dates will appear here once an order is scheduled.</p>
      </div>
    </motion.div>
  )
}


