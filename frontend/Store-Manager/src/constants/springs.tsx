import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"

export const calmSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 36,
  mass: 0.8,
}

export const overlaySpring = {
  type: "spring" as const,
  stiffness: 340,
  damping: 34,
  mass: 0.9,
}




