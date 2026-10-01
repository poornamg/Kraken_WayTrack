// src/components/monitoring/DayPlannerCard.tsx - Calendar and day planning card with live clock

import { useState, useEffect } from "react"
import { UnstyledButton } from "@/components/ui"
import { Order, ShopType } from "@/types"
import { dateInColombo } from "@/utils"

export function DayPlannerCard({
  day,
  filter,
  onOpenCalendar,
  onSelectDay,
  onSelectDate,
  selectedDate,
  orders,
  calendarOrders,
  liveMode = false,
}: {
  day: number
  filter: ShopType | null
  onOpenCalendar: () => void
  onSelectDay: (day: number) => void
  onSelectDate?: (date: string) => void
  selectedDate?: string
  orders?: Order[]
  calendarOrders?: Order[]
  liveMode?: boolean
}) {
  const live = liveMode
  const [clock, setClock] = useState(() => live ? new Date() : new Date(2026, 8, 27, 10, 42))
  const selected = selectedDate ? new Date(`${selectedDate}T12:00:00Z`) : null
  const todayIso = dateInColombo()
  const isToday = live ? selectedDate === todayIso : day === 27
  const scope = filter ?? "All"
  const visibleOrders = live
    ? (orders ?? []).filter((order) => !filter || order.type === filter)
    : []
  const todayDue = live ? visibleOrders.length : scope === "Fresh" ? 2 : scope === "Tech" ? 1 : scope === "Style" ? 2 : 5
  const todayUnscheduled =
    live ? visibleOrders.filter((order) => !order.stop).length : scope === "Fresh" || scope === "Style" ? 1 : scope === "Tech" ? 0 : 2
  const nextDue = live
    ? (calendarOrders ?? []).filter((order) => {
        if (!order.requestedDate || !selectedDate || !selected || (filter && order.type !== filter)) return false
        const offset = (new Date(`${order.requestedDate}T12:00:00Z`).getTime() - selected.getTime()) / 86_400_000
        return offset > 0 && offset <= 3
      }).length
    : scope === "Fresh" ? 3 : scope === "Tech" ? 2 : scope === "Style" ? 2 : 7
  const week = live && selected
    ? Array.from({ length: 7 }, (_, index) => {
        const value = new Date(selected)
        value.setUTCDate(selected.getUTCDate() - selected.getUTCDay() + index)
        const date = value.toISOString().slice(0, 10)
        return {
          date,
          label: value.toLocaleDateString("en", { weekday: "short", timeZone: "UTC" }),
          day: value.getUTCDate(),
          count: (calendarOrders ?? []).filter((order) => order.requestedDate === date && (!filter || order.type === filter)).length,
        }
      })
    : live
      ? []
      : [
        { label: "Sun", day: 27, count: 5 },
        { label: "Mon", day: 28, count: 3 },
        { label: "Tue", day: 29, count: 0 },
        { label: "Wed", day: 30, count: 4 },
        { label: "Thu", day: 1, count: 0 },
        { label: "Fri", day: 2, count: 3 },
        { label: "Sat", day: 3, count: 0 },
      ]

  useEffect(() => {
    const timer = window.setInterval(
      () => setClock(live ? new Date() : (current) => new Date(current.getTime() + 60_000)),
      60_000,
    )
    return () => window.clearInterval(timer)
  }, [live])

  return (
    <div className="day-planner-card">
      <div className="day-planner-card__top">
        <span className="day-planner-date">
          <small>{selected?.toLocaleDateString("en", { weekday: "short", timeZone: "UTC" }) ?? (live ? "—" : isToday ? "Sun" : "Mon")}</small>
          <strong>{selected?.getUTCDate() ?? (live ? "—" : day)}</strong>
          <b>{selected?.toLocaleDateString("en", { month: "short", timeZone: "UTC" }) ?? (live ? "" : "Sep")}</b>
        </span>
        <span className="day-planner-clock">
          <strong>
            {clock.toLocaleTimeString("en", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </strong>
          <span>
            <i /> Live{isToday ? "" : live ? ` · today ${new Date(`${todayIso}T12:00:00Z`).toLocaleDateString("en", { weekday: "short", day: "numeric", timeZone: "UTC" })}` : " · today Sun 27"}
          </span>
        </span>
        <UnstyledButton onClick={onOpenCalendar}>
          Open calendar →
        </UnstyledButton>
      </div>
      <div className="day-planner-stats">
        <div className="day-stat day-stat--due">
          <strong>{live ? todayDue : isToday ? todayDue : 3}</strong>
          <b>{isToday ? "Due today" : live ? selected ? `Due ${selected.toLocaleDateString("en", { weekday: "short", day: "numeric", timeZone: "UTC" })}` : "Due date" : "Due Mon 28"}</b>
          <span>
            {live ? todayUnscheduled : isToday ? todayUnscheduled : 2} not scheduled yet
          </span>
        </div>
        <div className="day-stat">
          <strong>{live || isToday ? nextDue : 1}</strong>
          <b>{live || isToday ? "Due next 3 days" : "Route scheduled"}</b>
          <span>{live ? "After the selected date" : isToday ? "Mon 28 – Wed 30" : "WP PK-7741 · 07:00"}</span>
        </div>
      </div>
      <div className="week-strip">
        {week.map((item) => (
          <UnstyledButton
            className={("date" in item ? item.date === selectedDate : item.day === day) ? "week-day week-day--active" : "week-day"}
            key={("date" in item && item.date) || `${item.label}-${item.day}`}
            onClick={() => live && "date" in item ? onSelectDate?.(item.date) : onSelectDay(item.day)}
          >
            <span>{item.label}</span>
            <strong>{item.day}</strong>
            {item.count ? <b>{item.count}</b> : null}
          </UnstyledButton>
        ))}
      </div>
    </div>
  )
}
