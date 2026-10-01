import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Text } from "./Text.js";
import { StatusPill } from "./StatusPill.js";

export type ConnectivityState = "online" | "offline" | "syncing" | "synced"

const connectivityConfig: Record<ConnectivityState, {
  description: string
  icon: LucideIcon
  label: string
  tone: string
}> = {
  online: {
    description: "Connected to WayLink",
    icon: Circle,
    label: "Online",
    tone: "success",
  },
  offline: {
    description: "Changes saved on device",
    icon: AlertTriangle,
    label: "Offline",
    tone: "warning",
  },
  syncing: {
    description: "Syncing changes…",
    icon: RefreshCw,
    label: "Syncing",
    tone: "action",
  },
  synced: {
    description: "All changes synced",
    icon: CheckCircle2,
    label: "Synced",
    tone: "success",
  },
}


export function ConnectivityIndicator({
  compact = false,
  detail,
  state,
}: {
  compact?: boolean
  detail?: string
  state: ConnectivityState
}) {
  const config = connectivityConfig[state]
  const Icon = config.icon

  return (
    <div
      className={cx(
        "connectivity",
        `connectivity--${config.tone}`,
        compact && "connectivity--compact",
      )}
      role="status"
    >
      <div className="connectivity__icon">
        <Icon
          aria-hidden="true"
          className={state === "syncing" ? "icon-spin" : undefined}
        />
      </div>
      <div className="connectivity__copy">
        <Text as="span" variant="label">
          {config.label}
        </Text>
        {compact && detail ? (
          <Text as="span" variant="caption">
            · {detail}
          </Text>
        ) : null}
        {!compact ? (
          <Text as="span" variant="caption">
            {config.description}
          </Text>
        ) : null}
      </div>
    </div>
  )
}
