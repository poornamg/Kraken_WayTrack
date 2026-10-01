import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Text } from "../ui/Text.js";

export function PageHeader({
  aside,
  eyebrow,
  subtitle,
  title,
}: {
  aside?: ReactNode
  eyebrow?: string
  subtitle: string
  title: ReactNode
}) {
  return (
    <div className="page-header">
      <div className="page-header__copy">
        {eyebrow ? (
          <Text variant="label" className="page-header__eyebrow">
            {eyebrow}
          </Text>
        ) : null}
        <Text as="h1" variant="h1">
          {title}
        </Text>
        <Text variant="body" className="page-header__subtitle">
          {subtitle}
        </Text>
      </div>
      {aside ? <div className="page-header__aside">{aside}</div> : null}
    </div>
  )
}
