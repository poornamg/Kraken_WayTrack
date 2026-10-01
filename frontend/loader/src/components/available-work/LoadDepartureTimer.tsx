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
import { useDepartureCountdown } from "../../hooks/useDepartureCountdown.js";


export function LoadDepartureTimer({ timing }: { timing: LoadTiming }) {
  const { completed, finalVariance, isPast, formatted } = useDepartureCountdown(timing)

  if (completed) {
    return (
      <div className="load-departure-timer load-departure-timer--completed">
        <Text variant="caption">COMPLETED</Text>
        <CompletionVarianceBadge finalVariance={finalVariance!} />
      </div>
    )
  }

  return (
    <div className="load-departure-timer">
      <Text variant="caption">TIME LEFT</Text>
      <Text variant="data" className={isPast ? "text-critical" : ""}>
        {isPast ? `-${formatted}` : formatted}
      </Text>
    </div>
  )
}
