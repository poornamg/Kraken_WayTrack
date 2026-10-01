import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { calmSpring } from "../../constants/springs"
import type { OrderType, ReceiptIssueType } from "../../types/index"

export function IssueChips({
  value,
  onChange,
  business = "fresh",
  orderType = "dry",
}: {
  value: ReceiptIssueType
  onChange: (value: ReceiptIssueType) => void
  business?: "fresh" | "style" | "tech"
  orderType?: OrderType
}) {
    let options: Array<{ value: ReceiptIssueType; label: string }> = [
    { value: "good", label: "Good" },
    { value: "missing", label: "Missing" },
    { value: "damaged", label: "Damaged" },
  ]
  if (business === "style") {
    options.push({ value: "wrong-variant", label: "Wrong item / variant" })
    options.push({ value: "condition", label: "Condition issue" })
  } else if (business === "tech") {
    options.push({ value: "wrong-item", label: "Wrong item" })
    options.push({ value: "seal", label: "Seal / package issue" })
  } else if (business === "fresh" && orderType === "chilled") {
    options.push({ value: "temperature", label: "Temperature issue" })
  }
  options.push({ value: "other", label: "Other" })
  return (
    <div className="issue-chips" role="radiogroup" aria-label="Issue type">
      {options.map((option) => (
        <motion.button
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={value === option.value ? "issue-chip--selected" : ""}
          key={option.value}
          onClick={() => onChange(option.value)}
          whileTap={{ scale: 0.97 }}
          transition={calmSpring}
        >
          {option.label}
        </motion.button>
      ))}
    </div>
  )
}


