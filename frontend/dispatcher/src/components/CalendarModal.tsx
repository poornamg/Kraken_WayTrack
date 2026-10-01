import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useState } from "react"
import type { Order } from "../data/sampleData"
import { Button, Heading, IconButton, ShopTag, UnstyledButton } from "./ui"

type CalendarModalProps = {
  initialDay: number
  orders: Order[]
  onClose: () => void
  onSchedule: (day: number, orderId?: string) => void
  onOpenDay: (day: number) => void
}

export function CalendarModal({
  initialDay,
  orders,
  onClose,
  onSchedule,
  onOpenDay,
}: CalendarModalProps) {
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState(initialDay)
  const monthDate = new Date(2026, 8 + monthOffset, 1)
  const monthName = monthDate.toLocaleString("en", {
    month: "long",
    year: "numeric",
  })
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate()
  const mondayOffset = (monthDate.getDay() + 6) % 7

  // Filter orders by selected day
  const ordersForDay = monthOffset === 0
    ? orders.filter((o) => (o.dueDay ?? 27) === selectedDay && !o.deferred)
    : []

  const hasOrders = ordersForDay.length > 0
  const selectedLabel = selectedDay === 27 ? "Sun" : selectedDay === 28 ? "Mon" : "Tue"

  return (
    <div
      className="modal-layer"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        aria-labelledby="calendar-title"
        aria-modal="true"
        className="modal calendar-modal"
        role="dialog"
      >
        <div className="calendar-main">
          <div className="calendar-heading">
            <Heading id="calendar-title">{monthName}</Heading>
            <IconButton
              icon={ChevronLeft}
              label="Previous month"
              onClick={() => {
                setMonthOffset((current) => current - 1)
                setSelectedDay(1)
              }}
            />
            <IconButton
              icon={ChevronRight}
              label="Next month"
              onClick={() => {
                setMonthOffset((current) => current + 1)
                setSelectedDay(1)
              }}
            />
          </div>

          <div className="calendar-weekdays">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {Array.from({ length: mondayOffset }, (_, index) => (
              <span key={`empty-${index}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1
              const hasDueOrders =
                monthOffset === 0 && [27, 28, 30, 2].includes(day)
              const isSelected = monthOffset === 0 && day === selectedDay
              const isToday = monthOffset === 0 && day === 27

              return (
                <UnstyledButton
                  className={
                    isSelected
                      ? "calendar-day calendar-day--selected"
                      : isToday
                        ? "calendar-day calendar-day--today"
                        : "calendar-day"
                  }
                  key={day}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                  {hasDueOrders ? <i /> : null}
                </UnstyledButton>
              )
            })}
          </div>

          <div className="calendar-legend">
            <span>
              <i /> Orders due
            </span>
            <span>
              <i /> Today
            </span>
          </div>
        </div>

        <div className="calendar-orders">
          <div className="calendar-orders__actions">
            <span className="calendar-live-chip">
              <i /> 10:42 AM · live
            </span>
            <Button
              onClick={() => {
                setMonthOffset(0)
                setSelectedDay(27)
              }}
              variant="secondary"
            >
              Today
            </Button>
            <IconButton icon={X} label="Close calendar" onClick={onClose} />
          </div>

          <Heading>
            {monthOffset === 0
              ? `${selectedLabel} ${selectedDay} Sep · orders due`
              : `${monthName} · orders due`}
          </Heading>

          {hasOrders ? (
            <>
              <p>
                {ordersForDay.length} orders due ·{" "}
                {ordersForDay.filter((o) => !o.stop).length || 2} not scheduled yet
              </p>
              <div className="calendar-order-list">
                {ordersForDay.map((order) => (
                  <UnstyledButton
                    className={`calendar-order ${order.emergency ? "calendar-order--emergency" : ""}`}
                    key={order.id}
                    onClick={() =>
                      // Opens the store order details pop-up (handled in App.tsx)
                      window.dispatchEvent(
                        new CustomEvent("waylink:open-order", { detail: order }),
                      )
                    }
                    title="Open order details"
                  >
                    <span>
                      <span className="calendar-order__top">
                        <span className="data-text">{order.id}</span>
                        <ShopTag type={order.type} />
                      </span>
                      <span>
                        {order.shop} · {order.kg} kg
                        {order.emergency ? " · Emergency" : ""}
                      </span>
                    </span>
                    <strong
                      className={
                        order.stop
                          ? "calendar-status calendar-status--scheduled"
                          : "calendar-status calendar-status--pending"
                      }
                    >
                      {order.stop ? "Scheduled" : "Not scheduled"}
                    </strong>
                  </UnstyledButton>
                ))}
              </div>
              <div className="calendar-date-actions">
                {selectedDay !== 27 ? (
                  <Button
                    onClick={() => onOpenDay(selectedDay)}
                    variant="secondary"
                  >
                    Open day plan
                  </Button>
                ) : null}
                <Button
                  onClick={() => onSchedule(selectedDay)}
                  variant="primary"
                >
                  {selectedDay === 27
                    ? "Schedule for today →"
                    : `Schedule for ${selectedLabel} ${selectedDay} →`}
                </Button>
              </div>
            </>
          ) : (
            <div className="calendar-empty">
              <CalendarDays aria-hidden="true" size={28} />
              <strong>No orders due</strong>
              <span>Select 27 or 28 September to view the delivery list.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

type LiveCalendarModalProps = {
  initialDate: string
  orders: Order[]
  onClose: () => void
  onOpenDate: (date: string) => void
  onScheduleDate: (date: string, orderId?: string) => void
}

const isoDate = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
const dateInZone = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date)
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

export function LiveCalendarModal({ initialDate, orders, onClose, onOpenDate, onScheduleDate }: LiveCalendarModalProps) {
  const initial = new Date(`${initialDate}T00:00:00+05:30`)
  const [monthDate, setMonthDate] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const monthName = monthDate.toLocaleString("en", { month: "long", year: "numeric" })
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const mondayOffset = (monthDate.getDay() + 6) % 7
  const today = dateInZone(new Date())
  const ordersForDay = orders.filter((order) => order.requestedDate === selectedDate && !order.deferred)
  const dueCounts = orders.reduce<Record<string, number>>((counts, order) => {
    if (order.requestedDate && !order.deferred) counts[order.requestedDate] = (counts[order.requestedDate] ?? 0) + 1
    return counts
  }, {})
  const selectedLabel = new Intl.DateTimeFormat("en", { dateStyle: "full", timeZone: "Asia/Colombo" }).format(new Date(`${selectedDate}T00:00:00+05:30`))

  const moveMonth = (offset: number) => {
    const next = new Date(monthDate.getFullYear(), monthDate.getMonth() + offset, 1)
    setMonthDate(next)
    setSelectedDate(isoDate(next.getFullYear(), next.getMonth(), 1))
  }

  return (
    <div className="modal-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section aria-labelledby="live-calendar-title" aria-modal="true" className="modal calendar-modal" role="dialog">
        <div className="calendar-main">
          <div className="calendar-heading">
            <Heading id="live-calendar-title">{monthName}</Heading>
            <IconButton icon={ChevronLeft} label="Previous month" onClick={() => moveMonth(-1)} />
            <IconButton icon={ChevronRight} label="Next month" onClick={() => moveMonth(1)} />
          </div>
          <div className="calendar-weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid">
            {Array.from({ length: mondayOffset }, (_, index) => <span key={`empty-${index}`} />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1
              const date = isoDate(monthDate.getFullYear(), monthDate.getMonth(), day)
              return (
                <UnstyledButton className={date === selectedDate ? "calendar-day calendar-day--selected" : date === today ? "calendar-day calendar-day--today" : "calendar-day"} key={date} onClick={() => setSelectedDate(date)}>
                  {day}{dueCounts[date] ? <i title={`${dueCounts[date]} orders due`} /> : null}
                </UnstyledButton>
              )
            })}
          </div>
          <div className="calendar-legend"><span><i /> Orders due</span><span><i /> Today</span></div>
        </div>
        <div className="calendar-orders">
          <div className="calendar-orders__actions">
            <span className="calendar-live-chip"><i /> Live queue</span>
            <Button onClick={() => {
              const date = new Date(`${today}T00:00:00+05:30`)
              setMonthDate(new Date(date.getFullYear(), date.getMonth(), 1))
              setSelectedDate(today)
            }} variant="secondary">Today</Button>
            <IconButton icon={X} label="Close calendar" onClick={onClose} />
          </div>
          <Heading>{selectedLabel} · orders due</Heading>
          {ordersForDay.length ? (
            <>
              <p>{ordersForDay.length} {ordersForDay.length === 1 ? "order" : "orders"} awaiting scheduling</p>
              <div className="calendar-order-list">
                {ordersForDay.map((order) => (
                  <UnstyledButton className={`calendar-order ${order.emergency ? "calendar-order--emergency" : ""}`} key={order.apiId ?? order.id} onClick={() => window.dispatchEvent(new CustomEvent("waylink:open-order", { detail: order }))} title="Open order details">
                    <span><span className="calendar-order__top"><span className="data-text">{order.id}</span><ShopTag type={order.type} /></span><span>{order.shop} · {order.kg.toLocaleString()} kg</span></span>
                    <strong className="calendar-status calendar-status--pending">Not scheduled</strong>
                  </UnstyledButton>
                ))}
              </div>
              <div className="calendar-date-actions">
                <Button onClick={() => onOpenDate(selectedDate)} variant="secondary">Open day plan</Button>
                <Button onClick={() => onScheduleDate(selectedDate)} variant="primary">Schedule {ordersForDay.length === 1 ? "order" : "orders"} →</Button>
              </div>
            </>
          ) : (
            <div className="calendar-empty"><CalendarDays aria-hidden="true" size={28} /><strong>No orders due</strong><span>Select a marked date to view its live order queue.</span></div>
          )}
        </div>
      </section>
    </div>
  )
}
