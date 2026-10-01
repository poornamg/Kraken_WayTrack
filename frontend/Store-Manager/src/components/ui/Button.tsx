import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { calmSpring } from "../../constants/springs"
import type { ButtonTone, ButtonSize } from "../../types/index"

export function Button({
  children,
  tone = "primary",
  size = "default",
  disabled,
  icon,
  className = "",
  onClick,
}: {
  children: ReactNode
  tone?: ButtonTone
  size?: ButtonSize
  disabled?: boolean
  icon?: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <motion.button
      className={`button button--${tone} button--${size} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
      whileTap={disabled ? undefined : { scale: 0.975 }}
      transition={calmSpring}
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  )
}


export function IconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      className="icon-button"
      aria-label={label}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}





