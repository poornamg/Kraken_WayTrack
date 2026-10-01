import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
export function LoaderShell({
  bottomActions,
  children,
  connectivity,
  connectivityDetail,
}: {
  bottomActions?: ReactNode
  children: ReactNode
  connectivity: ConnectivityState
  connectivityDetail?: string
}) {
  return (
    <div className="loader-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <WayLinkMark />
          </div>
          <div className="app-header__location">
            <Warehouse aria-hidden="true" />
            <Text as="span" variant="label">
              Warehouse - Peliyagoda
            </Text>
          </div>
          <div className="app-header__tools">
            <ConnectivityIndicator
              compact
              detail={connectivityDetail}
              state={connectivity}
            />
            <LoaderIdentity />
          </div>
        </div>
      </header>
      <main className="loader-shell__main">{children}</main>
      {bottomActions}
    </div>
  )
}
