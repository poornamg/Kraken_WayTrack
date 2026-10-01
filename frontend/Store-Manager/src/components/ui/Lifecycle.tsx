import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { Check } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { Button } from ".//Button"

export const timelineSteps = [
  "Order confirmed",
  "Scheduled",
  "On the way",
  "Arrived",
  "Receipt confirmation",
]


export function Lifecycle({
  deferred = false,
  interactive = false,
}: {
  deferred?: boolean
  interactive?: boolean
}) {
  const [currentStep, setCurrentStep] = useState(2)

  return (
    <div className="lifecycle-demo">
      <div className="lifecycle">
        {timelineSteps.map((step, index) => {
          const mode =
            deferred && index === 2
              ? "exception"
              : index < currentStep
                ? "complete"
                : index === currentStep
                  ? "current"
                  : "future"
          return (
            <motion.div
              className={`lifecycle-step lifecycle-step--${mode}`}
              key={step}
              layout
              transition={calmSpring}
            >
              <motion.span
                className="step-marker"
                layout
                transition={calmSpring}
              >
                {mode === "complete" ? <Check /> : index + 1}
              </motion.span>
              <span className="step-label">
                {deferred && index === 2 ? "Deferred" : step}
              </span>
            </motion.div>
          )
        })}
      </div>
      {interactive && (
        <div className="lifecycle-controls">
          <span>Prototype state: {timelineSteps[currentStep]}</span>
          <Button
            tone="secondary"
            onClick={() =>
              setCurrentStep((step) => (step + 1) % timelineSteps.length)
            }
          >
            Advance status
          </Button>
        </div>
      )}
    </div>
  )
}


