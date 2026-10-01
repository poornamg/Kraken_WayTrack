import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
export type TextVariant = "display" | "h1" | "h2" | "h3" | "body" | "body-strong" | "label" | "caption" | "data";
export type TextTag = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "label";

export function Text({
  as = "p",
  children,
  className,
  variant = "body",
}: {
  as?: TextTag
  children: ReactNode
  className?: string
  variant?: TextVariant
}) {
  return createElement(
    as,
    { className: cx("text", `text--${variant}`, className) },
    children,
  )
}
