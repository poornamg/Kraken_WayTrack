// src/domain/constraints.ts - Pure constraint-checking functions (weight, volume, temperature, access, trip limits, fuel quota)

import { Vehicle, Order } from '@/types'
import { DAILY_TURN_LIMIT } from '@/constants'

export const VEHICLE_DAY: Record<string, { turnsToday: number; volumeM3: number }> = {
  "WP PH-2210": { turnsToday: 1, volumeM3: 6 },
  "WP PK-7741": { turnsToday: 2, volumeM3: 6 },
  "WP LC-8870": { turnsToday: 0, volumeM3: 18 },
  "WP LE-1123": { turnsToday: 1, volumeM3: 30 },
  "WP LR-5006": { turnsToday: 0, volumeM3: 12 },
}

export function vehicleDay(v: Vehicle) {
  if (v.volumeM3 !== undefined && v.turnsToday !== undefined) {
    return { turnsToday: v.turnsToday, volumeM3: v.volumeM3 }
  }
  const known = VEHICLE_DAY[v.id]
  const fallbackVolume =
    v.type === "Van" ? 6 : v.type === "Refrigerated" ? 12 : v.capacityKg >= 3000 ? 30 : 18
  return {
    turnsToday: known?.turnsToday ?? 0,
    volumeM3: known?.volumeM3 ?? fallbackVolume,
  }
}

export function isAtQuota(v: Vehicle): boolean {
  return v.turns >= v.turnQuota || v.km >= v.kmQuota
}

export function isDayLimit(v: Vehicle): boolean {
  return vehicleDay(v).turnsToday >= DAILY_TURN_LIMIT
}

export function canGo(v: Vehicle): boolean {
  return !isAtQuota(v) && !isDayLimit(v)
}

/** Count one more turn today for this vehicle (after a route is scheduled). */
export function recordTurn(v: Vehicle): void {
  const day = vehicleDay(v)
  VEHICLE_DAY[v.id] = { ...day, turnsToday: day.turnsToday + 1 }
}

/** Estimated volume of an order in m³, from its items (e.g. "12 crates"). */
export function orderVolume(o: Order): number {
  const match = o.items.match(/(\d+)\s*(crate|box|bag|pallet)/i)
  if (!match) return Math.round((o.kg / 250) * 100) / 100
  const perUnit: Record<string, number> = { crate: 0.06, box: 0.04, bag: 0.03, pallet: 1.2 }
  return Math.round(Number(match[1]) * (perUnit[match[2].toLowerCase()] ?? 0.04) * 100) / 100
}

export function volumeOf(list: Order[]): number {
  return Math.round(list.reduce((sum, o) => sum + orderVolume(o), 0) * 10) / 10
}

/** Why a vehicle can't be picked, or null if it can. */
export function blockedReason(v: Vehicle): string | null {
  if (isAtQuota(v)) return "Quota reached"
  if (isDayLimit(v)) return `Day limit · ${DAILY_TURN_LIMIT}/${DAILY_TURN_LIMIT} turns`
  return null
}

export function checkWeightConstraint(orders: Order[], vehicle: Vehicle) {
  const totalKg = orders.reduce((sum, o) => sum + o.kg, 0)
  return {
    totalKg,
    capacityKg: vehicle.capacityKg,
    exceeded: totalKg > vehicle.capacityKg,
    percentage: Math.round((totalKg / vehicle.capacityKg) * 100)
  }
}

export function checkVolumeConstraint(orders: Order[], vehicle: Vehicle) {
  const totalVolume = volumeOf(orders)
  const capacityVolume = vehicleDay(vehicle).volumeM3
  return {
    totalVolume,
    capacityVolume,
    exceeded: totalVolume > capacityVolume,
    percentage: Math.round((totalVolume / capacityVolume) * 100)
  }
}

export function checkTemperatureConstraint(orders: Order[], vehicle: Vehicle) {
  const requiresReefer = orders.some((o) => o.type === "Fresh")
  const isCompliant = !requiresReefer || vehicle.type === "Refrigerated"
  return {
    requiresReefer,
    isCompliant,
    violation: requiresReefer && vehicle.type !== "Refrigerated"
  }
}
