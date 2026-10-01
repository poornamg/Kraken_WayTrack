// src/types/index.ts - Core domain models and entity types for Dispatcher system

export type ShopType = "Fresh" | "Tech" | "Style"

export type RouteRecord = {
  id: string
  route: string
  tags: ShopType[]
  done: number
  total: number
  remarks: number
  start?: string
  estEnd?: string
  stops?: Array<{
    shop: string
    address?: string
    arrived?: string
    eta?: string
  }>
}

export type Vehicle = {
  id: string
  type: "Van" | "Lorry" | "Refrigerated"
  capacityKg: number
  length: string
  turns: number
  turnQuota: number
  km: number
  kmQuota: number
  fuel: number
  volumeM3?: number
  turnsToday?: number
}

export type Order = {
  apiId?: string
  requestedDate?: string
  id: string
  shop: string
  town: string
  type: ShopType
  items: string
  kg: number
  emergency?: boolean
  inReach: boolean
  suggested: boolean
  stop?: number
  deferred?: boolean
  deferredTo?: string
  deferredNotice?: string
  dueDay?: number
}

export type Person = {
  id: string
  name: string
  role: string
  phone: string
  shop?: string
  live?: boolean
  lastSeen?: string
  speedKmh?: number
}

export type Remark = {
  id: string
  role: "Driver" | "Loader" | "Stock manager"
  author: Person
  time: string
  text: string
  stopName: string
  stopNumber: number
  reviewed: boolean
  notice?: string
  alsoNotify?: string[]
}
