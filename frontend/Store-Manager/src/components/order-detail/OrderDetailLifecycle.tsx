import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { Check } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import type { OrderDetailState } from "../../types/index"

export function OrderDetailLifecycle({ state, wasDeferred }: { state: OrderDetailState, wasDeferred: boolean }) {
  
  const stages = wasDeferred ? [
    "Order confirmed",
    "Deferred",
    "Scheduled",
    "On the way",
    "Arrived",
    "Receipt confirmation",
  ] : [
    "Order confirmed",
    "Scheduled",
    "On the way",
    "Arrived",
    "Receipt confirmation",
  ];

  let currentStep = 0;
  if (state === "confirmed") currentStep = 0;
  else if (state === "deferred") currentStep = 1;
  else if (state === "scheduled") currentStep = wasDeferred ? 2 : 1;
  else if (state === "on-way") currentStep = wasDeferred ? 3 : 2;
  else if (state === "arrived") currentStep = wasDeferred ? 4 : 3;
  else currentStep = wasDeferred ? 5 : 4;

  const receiptComplete = state === "receipt-confirmed" || state === "receipt-issue";
  
  const timestamps = stages.map((s, i) => {
    if (i > currentStep && !receiptComplete) return "-";
    if (s === "Order confirmed") return "Wed · 13:46";
    if (s === "Deferred") return "Wed · 16:42";
    if (s === "Scheduled") return "Wed · 16:35";
    if (s === "On the way") return "Thu · 05:48";
    if (s === "Arrived") return "Thu · 06:43";
    if (s === "Receipt confirmation") {
      if (state === "receipt-confirmed") return "Thu · 06:57";
      if (state === "receipt-issue") return "Thu · 06:59";
      if (state === "awaiting-confirmation") return "Current";
      return "-";
    }
    return "-";
  });

  return (
    <div className="order-detail-timeline-card">
      <div className="order-detail-lifecycle lifecycle">
        {stages.map((stage, index) => {
          const mode = receiptComplete
            ? "complete"
            : index < currentStep
              ? "complete"
              : index === currentStep
                ? "current"
                : "future"
          return (
            <motion.div
              className={`lifecycle-step lifecycle-step--${mode}`}
              key={stage}
              layout
              transition={calmSpring}
            >
              <motion.span className="step-marker" layout>
                {mode === "complete" ? <Check /> : index + 1}
              </motion.span>
              <span className="step-label">{stage}</span>
              <small>{timestamps[index]}</small>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}


