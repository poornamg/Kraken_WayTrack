import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { Home } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { BrandMark } from "../ui/BrandMark"
import { navigation } from ".//navigation"

export function Sidebar({
  current,
  onNavigate,
}: {
  current: string
  onNavigate: (label: string) => void
}) {
  return (
    <aside className="sidebar">
      <BrandMark onClick={() => onNavigate("Home")} />
      <nav className="side-nav" aria-label="Primary navigation">
        {navigation.map(({ label, icon: Icon }) => (
          <motion.button
            className={`nav-item ${
              current === label ? "nav-item--selected" : ""
            }`}
            key={label}
            onClick={() => onNavigate(label)}
            type="button"
            whileTap={{ scale: 0.98 }}
            transition={calmSpring}
          >
            {current === label && (
              <motion.span
                className="nav-selection"
                layoutId="desktop-nav-selection"
                transition={calmSpring}
              />
            )}
            <Icon className="nav-content" />
            <span className="nav-content">{label}</span>
          </motion.button>
        ))}
      </nav>
      <div className="sidebar-profile">
        <span className="avatar avatar--dark">DF</span>
        <span className="profile-copy">
          <strong>Dilini Fernando</strong>
          <small>Store Manager</small>
        </span>
      </div>
    </aside>
  )
}


