// src/utils/index.ts - Core utilities, map calculations, and path helpers

import { Order } from '@/types'
import { OPEN_ORDER_EVENT } from '@/constants'

export function getInitialPath(): string {
  if (window.location.pathname.startsWith("/monitor/")) {
    return window.location.pathname
  }
  if (window.location.pathname.startsWith("/orders")) return "/orders"
  return window.location.pathname.startsWith("/schedule")
    ? "/schedule"
    : "/home"
}

export function dateInColombo(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

export function datePlusDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

/** Open the store order details pop-up from anywhere in the app. */
export function openOrderDetails(order: Order): void {
  window.dispatchEvent(new CustomEvent<Order>(OPEN_ORDER_EVENT, { detail: order }))
}

/** Click / Enter on an order row opens its details, except on its buttons. */
export function orderRowOpenProps(order: Order) {
  return {
    role: "button" as const,
    tabIndex: 0,
    title: "Open order details",
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      if ((e.target as HTMLElement).closest("button")) return
      openOrderDetails(order)
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" && e.target === e.currentTarget) openOrderDetails(order)
    },
  }
}

export const DEPOT = { x: 50, y: 232 }

export const TOWN_POS: Record<string, { x: number; y: number }> = {
  "Galle Fort": { x: 70, y: 262 },
  Galle: { x: 92, y: 244 },
  Hikkaduwa: { x: 36, y: 170 },
  Baddegama: { x: 120, y: 120 },
  Unawatuna: { x: 150, y: 256 },
  Ahangama: { x: 220, y: 262 },
  Koggala: { x: 200, y: 260 },
  Mirissa: { x: 330, y: 266 },
  Weligama: { x: 280, y: 264 },
  Matara: { x: 400, y: 264 },
  Akuressa: { x: 310, y: 130 },
  Hakmana: { x: 420, y: 170 },
  Dickwella: { x: 470, y: 266 },
}

export function dayLabel(day: number) {
  const date = new Date(2026, 8, day)
  return {
    weekday: date.toLocaleString("en", { weekday: "short" }),
    short: `${date.toLocaleString("en", { weekday: "short" })} ${day} Sep`,
  }
}

export function pinsFor(list: Order[]) {
  const seen: Record<string, number> = {}
  const pins: Record<string, { x: number; y: number }> = {}
  list.forEach((o, i) => {
    const base = TOWN_POS[o.town] ?? { x: 120 + i * 70, y: 200 - (i % 2) * 40 }
    const n = seen[o.town] ?? 0
    seen[o.town] = n + 1
    pins[o.id] = { x: base.x + n * 22, y: base.y + n * 16 }
  })
  return pins
}

export function routeNameFor(list: Order[]): string {
  const pins = pinsFor(list)
  if (!list.length) return "Galle"
  const far = list.reduce((a, b) => (pins[b.id].x > pins[a.id].x ? b : a))
  return `Galle → ${far.town}`
}
