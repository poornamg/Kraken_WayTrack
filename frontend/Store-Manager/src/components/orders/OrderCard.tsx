import { motion } from "motion/react"
import { ArrowRight, CalendarDays } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { StatusPill } from "../ui/StatusPill"
import type { StatusKind } from "../../types"

export interface OrderItem {
  id: string
  type: string
  date: string
  statusLabel: string
  status: StatusKind
  view: string
  state: string
  eta?: string
  subtext?: string
}

export function OrderCard({
  order,
  onClick,
}: {
  order: OrderItem
  onClick: () => void
}) {
  return (
    <motion.button
      key={order.id}
      className="upcoming-row"
      type="button"
      layout
      onClick={onClick}
      whileTap={{ scale: 0.99 }}
      transition={calmSpring}
    >
      <span className="upcoming-record">
        <strong className="data-id">{order.id}</strong>
        <span>{order.type}</span>
      </span>
      <span className="upcoming-date">
        <CalendarDays />
        {order.date}
      </span>
      <span className="upcoming-status">
        <StatusPill kind={order.status} />
        {(order.eta || order.subtext) && (
          <small style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {order.eta && <span>{order.eta}</span>}
            {order.subtext && <span style={{ opacity: 0.8 }}>{order.subtext}</span>}
          </small>
        )}
      </span>
      <ArrowRight className="row-arrow" />
    </motion.button>
  )
}
