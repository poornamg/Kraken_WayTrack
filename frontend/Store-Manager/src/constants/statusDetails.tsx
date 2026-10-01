import type { ReactNode } from "react"
import { AlertTriangle, CalendarDays, CheckCircle2, CircleAlert, Clock3, PackageCheck, Truck } from "lucide-react"
import type { StatusKind } from "../types/index"

export const statusDetails: Record<StatusKind, {
  label: string
  icon: ReactNode
}> = {
  confirmed: { label: "Order confirmed", icon: <CheckCircle2 /> },
  scheduled: { label: "Scheduled", icon: <CalendarDays /> },
  transit: { label: "On the way", icon: <Truck /> },
  arrived: { label: "Arrived", icon: <CheckCircle2 /> },
  deferred: { label: "Deferred", icon: <Clock3 /> },
  awaiting: { label: "Awaiting confirmation", icon: <CircleAlert /> },
  received: { label: "Receipt confirmed", icon: <PackageCheck /> },
  issue: { label: "Receipt confirmed with issue", icon: <AlertTriangle /> },
}
