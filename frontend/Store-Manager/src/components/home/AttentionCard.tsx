import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { ReceiptText } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { Button } from "../ui/Button"

export function AttentionCard({ highlighted = false, onOpen }: { highlighted?: boolean, onOpen?: () => void }) {
  return (
    <motion.div
      className={`attention-card ${
        highlighted ? "attention-card--highlighted" : ""
      }`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, scale: highlighted ? 1.006 : 1 }}
      transition={calmSpring}
    >
      <span className="attention-icon">
        <ReceiptText />
      </span>
      <div className="attention-copy">
        <strong>Delivery awaiting confirmation</strong>
        <p>
          <span className="data-id">ORD-1045</span> · Driver completed delivery
          at 06:52.
        </p>
        <small>Confirm the received quantities when ready.</small>
      </div>
      <Button tone="secondary" onClick={onOpen}>Review delivery</Button>
    </motion.div>
  )
}


