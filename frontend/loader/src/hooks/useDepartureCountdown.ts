import { useState, useEffect } from "react"
import type { LoadTiming } from "../data/mock-data.js"

export function useDepartureCountdown(timing: LoadTiming) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (timing.finalVariance !== undefined) return

    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [timing.finalVariance])

  if (timing.finalVariance !== undefined) {
    return { completed: true, finalVariance: timing.finalVariance }
  }

  const diff = timing.departureAt - now
  const isPast = diff < 0
  const absDiff = Math.abs(diff)
  const m = Math.floor(absDiff / 60000)
  const s = Math.floor((absDiff % 60000) / 1000)
  const formatted = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`

  return { completed: false, isPast, formatted }
}
