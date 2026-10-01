import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  iconPosition?: "start" | "end"
  size?: "standard" | "large"
  variant?: ButtonVariant
}


export function Button({
  children,
  className,
  icon: Icon,
  iconPosition = "start",
  size = "standard",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "button",
        `button--${variant}`,
        `button--${size}`,
        className,
      )}
      type={type}
      {...props}
    >
      {Icon && iconPosition === "start" ? <Icon aria-hidden="true" /> : null}
      <span>{children}</span>
      {Icon && iconPosition === "end" ? <Icon aria-hidden="true" /> : null}
    </button>
  )
}

type StatusVariant = "online" | "loaded" | "missing" | "damaged" | "offline" | "in-progress" | "synced" | "changed" | "normal" | "urgent"

const statusConfig: Record<StatusVariant, {
  icon: LucideIcon
  label: string
  tone: string
}> = {
  online: { icon: Circle, label: "Online", tone: "success" },
  loaded: { icon: CheckCircle2, label: "Loaded", tone: "success" },
  missing: { icon: XCircle, label: "Missing", tone: "critical" },
  damaged: { icon: Hammer, label: "Damaged", tone: "warning" },
  offline: { icon: CloudOff, label: "Offline", tone: "warning" },
  "in-progress": {
    icon: LoaderCircle,
    label: "In progress",
    tone: "action",
  },
  synced: { icon: ShieldCheck, label: "Synced", tone: "success" },
  changed: { icon: AlertTriangle, label: "Changed", tone: "warning" },
  normal: { icon: Check, label: "Normal", tone: "neutral" },
  urgent: { icon: Clock3, label: "Urgent", tone: "warning" },
}
