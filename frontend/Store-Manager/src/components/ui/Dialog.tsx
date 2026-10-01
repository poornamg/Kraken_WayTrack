import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { X } from "lucide-react"
import { overlaySpring } from "../../constants/springs"
import { Button, IconButton } from ".//Button"

export function Dialog({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="dialog-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <motion.div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={overlaySpring}
      >
        <div className="dialog-header">
          <div>
            <span className="dialog-title" id="dialog-title">
              Submit order?
            </span>
            <p>
              Review the order details before it enters tomorrow’s planning run.
            </p>
          </div>
          <IconButton label="Close dialog" onClick={onClose}>
            <X />
          </IconButton>
        </div>
        <div className="dialog-summary">
          <span>
            <small>Order</small>
            <strong className="data-id">ORD-1045</strong>
          </span>
          <span>
            <small>Products</small>
            <strong>4 products · 80 units</strong>
          </span>
        </div>
        <div className="dialog-footer">
          <Button tone="secondary" onClick={onClose}>
            Back to edit
          </Button>
          <Button onClick={onClose}>Submit order</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}


