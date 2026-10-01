import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { AlertTriangle, ArrowRight, PackageOpen, X } from "lucide-react"
import { overlaySpring } from "../../constants/springs"
import { Button, IconButton } from ".//Button"

export function BottomSheet({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="sheet-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <motion.div
        className="bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={overlaySpring}
      >
        <span className="sheet-handle" />
        <div className="sheet-header">
          <div>
            <span className="dialog-title" id="sheet-title">
              Select issue reason
            </span>
            <p>Choose the reason that best describes the received goods.</p>
          </div>
          <IconButton label="Close bottom sheet" onClick={onClose}>
            <X />
          </IconButton>
        </div>
        <div className="reason-list">
          <button type="button">
            <PackageOpen />
            <span>
              <strong>Items missing</strong>
              <small>Received quantity is lower than ordered.</small>
            </span>
            <ArrowRight />
          </button>
          <button type="button">
            <AlertTriangle />
            <span>
              <strong>Items damaged</strong>
              <small>Goods were damaged before receipt.</small>
            </span>
            <ArrowRight />
          </button>
        </div>
        <Button size="mobile" onClick={onClose}>
          Continue
        </Button>
      </motion.div>
    </motion.div>
  )
}


