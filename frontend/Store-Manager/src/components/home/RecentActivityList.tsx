import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { calmSpring } from "../../constants/springs"
import { statusDetails } from "../../types/index"
import { recentActivity } from "../../data/mockData"

export function RecentActivityList() {
  return (
    <div className="activity-list">
      {recentActivity.map((activity) => {
        const details = statusDetails[activity.kind]
        return (
          <motion.button
            className="activity-row"
            type="button"
            key={activity.id}
            whileTap={{ scale: 0.99 }}
            transition={calmSpring}
          >
            <span
              className={`activity-icon activity-icon--${activity.kind}`}
              aria-hidden="true"
            >
              {details.icon}
            </span>
            <span className="activity-copy">
              <strong className="data-id">{activity.id}</strong>
              <span>{activity.label}</span>
            </span>
            <time>{activity.time}</time>
          </motion.button>
        )
      })}
    </div>
  )
}


