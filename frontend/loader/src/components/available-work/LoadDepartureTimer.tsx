import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Text } from "../ui/Text.js";
import type { LoadTiming } from "../../data/mock-data.js";

export function LoadDepartureTimer({ timing }: { timing: LoadTiming }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (timing.finalVariance !== undefined) return

    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [timing.finalVariance])

  if (timing.finalVariance !== undefined) {
    return (
      <div className="load-departure-timer load-departure-timer--completed">
        <Text variant="caption">COMPLETED</Text>
        <CompletionVarianceBadge finalVariance={timing.finalVariance} />
      </div>
    )
  }

  const diff = timing.departureAt - now
  const isPast = diff < 0
  const absDiff = Math.abs(diff)
  const m = Math.floor(absDiff / 60000)
  const s = Math.floor((absDiff % 60000) / 1000)
  const formatted = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`

  return (
    <div className="load-departure-timer">
      <Text variant="caption">TIME LEFT</Text>
      <Text variant="data" className={isPast ? "text-critical" : ""}>
        {isPast ? `-${formatted}` : formatted}
      </Text>
    </div>
  )
}
