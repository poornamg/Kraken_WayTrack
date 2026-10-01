import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { calmSpring } from "../../constants/springs"
import type { CatalogProduct } from "../../types/index"
import { pluralizeUnit } from "../../utils/index"

export function SummaryItems({
  items,
}: {
  items: Array<CatalogProduct & { quantity: number }>
}) {
  return (
    <motion.div className="summary-items" layout>
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            className="summary-item"
            key={item.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={calmSpring}
          >
            <span>{item.name}</span>
            <strong>
              {item.quantity} {pluralizeUnit(item.unit, item.quantity)}
            </strong>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}


