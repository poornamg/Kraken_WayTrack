import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Text } from "../ui/Text.js";

export type LoadItemStatus = "pending" | "loaded" | "flagged"


export type ExceptionType = "missing" | "damaged"


export type LoadItemException = {
  affectedQuantity: number
  note?: string
  pendingSync: boolean
  reason: string
  type: ExceptionType
  unit: string
}


export type LoadItemData = {
  exception?: LoadItemException
  id: string
  name: string
  quantity: string
  status: LoadItemStatus
}

function formatQuantity(amount: number, unit: string) {
  return `${amount} ${amount === 1 ? unit.replace(/s$/, "") : unit}`
}


export function LoadItem({
  item,
  onFlag,
  onMarkLoaded,
}: {
  item: LoadItemData
  onFlag: () => void
  onMarkLoaded: () => void
}) {
  return (
    <div className={`load-item load-item--${item.status}`}>
      <div className="load-item__product">
        <div className="load-item__icon" aria-hidden="true">
          <Package />
        </div>
        <div>
          <Text variant="body-strong">{item.name}</Text>
          <Text variant="data">{item.quantity}</Text>
        </div>
      </div>
      <div className="load-item__state">
        {item.status === "loaded" ? (
          <StatusPill variant="loaded" />
        ) : item.status === "flagged" ? (
          <div className="load-item__exception-state">
            <StatusPill
              variant="changed"
              label={
                item.exception?.pendingSync
                  ? "Flagged · Pending sync"
                  : "Flagged"
              }
            />
            <Text variant="caption">
              {item.exception
                ? `${formatQuantity(
                    item.exception.affectedQuantity,
                    item.exception.unit,
                  )} · ${item.exception.type.toUpperCase()}`
                : "Exception recorded"}
            </Text>
          </div>
        ) : (
          <StatusPill variant="normal" label="Pending" />
        )}
      </div>
      <div className="load-item__actions">
        {item.status === "pending" ? (
          <Button variant="primary" icon={Check} onClick={onMarkLoaded}>
            Mark loaded
          </Button>
        ) : null}
        <Button
          variant="secondary"
          icon={Flag}
          onClick={onFlag}
          aria-label={`${
            item.status === "flagged" ? "Review flag for" : "Flag"
          } ${item.name}`}
        >
          {item.status === "flagged" ? "Review flag" : "Flag"}
        </Button>
      </div>
    </div>
  )
}
