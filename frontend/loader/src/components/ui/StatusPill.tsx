import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Text } from "./Text.js";

export function StatusPill({
  label,
  variant,
}: {
  label?: string
  variant: StatusVariant
}) {
  const config = statusConfig[variant]
  const Icon = config.icon

  return (
    <span className={cx("status-pill", `status-pill--${config.tone}`)}>
      <Icon aria-hidden="true" />
      <span>{label ?? config.label}</span>
    </span>
  )
}
