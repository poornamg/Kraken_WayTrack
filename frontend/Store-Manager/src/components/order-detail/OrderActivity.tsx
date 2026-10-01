import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { AlertTriangle, PackageCheck } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { orderDetailStep } from ".//orderDetailData"
import type { OrderDetailState } from "../../types/index"
import { orderActivity } from "../../data/mockData"

export function OrderActivity({ state }: { state: OrderDetailState }) {
  const currentStep = orderDetailStep[state]
  const receiptComplete =
    state === "receipt-confirmed" || state === "receipt-issue"
  return (
    <div className="order-activity-list">
      {orderActivity
        .filter((activity) => activity.step <= currentStep)
        .map((activity) => (
          <motion.div
            className="order-activity-row"
            key={activity.label}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={calmSpring}
          >
            <span>{activity.icon}</span>
            <div>
              <strong>{activity.label}</strong>
              <small>{activity.time}</small>
            </div>
          </motion.div>
        ))}
      {receiptComplete && (
        <motion.div
          className="order-activity-row"
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={calmSpring}
        >
          <span>
            {state === "receipt-confirmed" ? (
              <PackageCheck />
            ) : (
              <AlertTriangle />
            )}
          </span>
          <div>
            <strong>
              {state === "receipt-confirmed"
                ? "Receipt confirmed"
                : "Receipt confirmed with issue"}
            </strong>
            <small>
              {state === "receipt-confirmed" ? "Thu · 06:57" : "Thu · 06:59"}
            </small>
          </div>
        </motion.div>
      )}
    </div>
  )
}


