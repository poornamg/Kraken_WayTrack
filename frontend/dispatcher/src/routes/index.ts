// src/routes/index.ts - Application route definitions and helpers

export const ROUTES = {
  HOME: "/home",
  SCHEDULE: "/schedule",
  ORDERS: "/orders",
  MONITOR: "/monitor/:routeId"
} as const

export function isMonitorPath(path: string): boolean {
  return path.startsWith("/monitor/")
}

export function extractMonitorRouteId(path: string): string | null {
  if (!isMonitorPath(path)) return null
  const clean = path.split("?")[0]
  return clean.replace("/monitor/", "")
}

export function getInitialPath(): string {
  const p = window.location.pathname
  return ["/home", "/schedule", "/orders"].includes(p) || p.startsWith("/monitor/")
    ? p
    : "/home"
}
