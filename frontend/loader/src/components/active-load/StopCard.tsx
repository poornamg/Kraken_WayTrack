import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Text } from "../ui/Text.js";
import { Card } from "../ui/Card.js";
import { LoadItem } from "./LoadItem.js";
import type { LoadItemData, LoadItemException } from "./LoadItem.js";

export function StopCard({
  deliveryWindow,
  isActive,
  isComplete,
  items,
  onFlagItem,
  onMarkLoaded,
  orderId,
  outlet,
  stopNumber,
}: {
  deliveryWindow: string
  isActive: boolean
  isComplete: boolean
  items: LoadItemData[]
  onFlagItem: (itemId: string) => void
  onMarkLoaded: (itemId: string) => void
  orderId: string
  outlet: string
  stopNumber: number
}) {
  const accountedItems = items.filter(
    (item) => item.status !== "pending",
  ).length
  const loadedItems = items.filter((item) => item.status === "loaded").length
  const flaggedItems = items.filter((item) => item.status === "flagged").length

  return (
    <section
      className={`stop-card ${isActive ? "stop-card--active" : ""} ${
        isComplete ? "stop-card--complete" : ""
      }`}
      id={`stop-${stopNumber}`}
      aria-labelledby={`stop-${stopNumber}-title`}
    >
      <div className="stop-card__header">
        <div className="stop-card__number" aria-hidden="true">
          <Text as="span" variant="caption">
            Stop
          </Text>
          <Text as="span" variant="data">
            {String(stopNumber).padStart(2, "0")}
          </Text>
        </div>
        <div className="stop-card__outlet">
          <div className="stop-card__title-row">
            <Text as="h2" variant="h2" className="stop-card__title">
              <span id={`stop-${stopNumber}-title`}>{outlet}</span>
            </Text>
            {isComplete ? (
              <StatusPill variant="loaded" label="Stop accounted" />
            ) : isActive ? (
              <StatusPill variant="in-progress" label="Next to load" />
            ) : null}
          </div>
          <div className="stop-card__meta">
            <span>
              <Clock3 aria-hidden="true" />
              <Text as="span" variant="label">
                Delivery · {deliveryWindow}
              </Text>
            </span>
            <span>
              <PackageCheck aria-hidden="true" />
              <Text as="span" variant="label">
                {accountedItems}/{items.length} accounted
              </Text>
            </span>
            <Text as="span" variant="caption" className="stop-card__breakdown">
              {loadedItems} loaded · {flaggedItems} flagged
            </Text>
          </div>
        </div>
      </div>
      <div className="stop-card__order">
        <div className="stop-card__order-heading">
          <Store aria-hidden="true" />
          <div>
            <Text variant="caption">Order</Text>
            <Text variant="data">#{orderId}</Text>
          </div>
        </div>
        <Text variant="caption">
          {items.length} {items.length === 1 ? "item" : "items"}
        </Text>
      </div>
      <div className="stop-card__items">
        {items.map((item) => (
          <LoadItem
            item={item}
            key={item.id}
            onFlag={() => onFlagItem(item.id)}
            onMarkLoaded={() => onMarkLoaded(item.id)}
          />
        ))}
      </div>
    </section>
  )
}

const missingReasons = ["Stock unavailable", "Short quantity", "Cannot locate"]

const damagedReasons = [
  "Damaged during handling",
  "Damaged before loading",
  "Packaging damaged",
]

function parseExpectedQuantity(quantity: string) {
  const match = quantity.match(/^(\d+(?:\.\d+)?)\s*(.*)$/)
  return {
    amount: match ? Number(match[1]) : 1,
    unit: match?.[2] || "item",
  }
}
