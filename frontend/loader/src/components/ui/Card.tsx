import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "standard" | "compact"
  variant?: CardVariant
}


export function Card({
  children,
  className,
  padding = "standard",
  variant = "standard",
  ...props
}: CardProps) {
  return (
    <div
      className={cx(
        "card",
        `card--${variant}`,
        `card--padding-${padding}`,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
