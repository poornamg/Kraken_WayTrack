import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
export function BottomActionBar({
  context,
  primaryAction,
  secondaryAction,
}: {
  context?: ReactNode
  primaryAction: ReactNode
  secondaryAction?: ReactNode
}) {
  return (
    <div className="bottom-action-bar">
      <div className="bottom-action-bar__inner">
        {context ? (
          <div className="bottom-action-bar__context">{context}</div>
        ) : null}
        <div className="bottom-action-bar__actions">
          {secondaryAction}
          {primaryAction}
        </div>
      </div>
    </div>
  )
}
