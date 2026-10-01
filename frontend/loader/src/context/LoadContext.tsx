import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { initialLoadCases, initialStops } from "../data/mock-data.js"
import type { ActiveStop, LoadCase, LoadTiming } from "../data/mock-data.js"
import { loadApi, type LoadRecord } from "../services/loads.js"
import type { LoadItemData, LoadItemException } from "../components/active-load/LoadItem.js"

interface LoadContextValue {
  loadCases: LoadCase[]
  setLoadCases: React.Dispatch<React.SetStateAction<LoadCase[]>>
  stops: ActiveStop[]
  setStops: React.Dispatch<React.SetStateAction<ActiveStop[]>>
  activeVehicle: string | null
  setActiveVehicle: React.Dispatch<React.SetStateAction<string | null>>
  activeLoad?: LoadCase
  applyManifest: (record: LoadRecord) => void
  setActiveVersion: (version: number) => void
  updateLoadedItem: (item: LoadItemData) => Promise<void>
  updateException: (item: LoadItemData, exception: LoadItemException) => Promise<void>
}

const LoadContext = createContext<LoadContextValue | null>(null)

export function useLoadContext() {
  const ctx = useContext(LoadContext)
  if (!ctx) throw new Error("useLoadContext must be used within LoadProvider")
  return ctx
}

export function LoadProvider({ children }: { children: ReactNode }) {
  const [stops, setStops] = useState<ActiveStop[]>(initialStops)
  const [loadCases, setLoadCases] = useState<LoadCase[]>(initialLoadCases)
  const [activeVehicle, setActiveVehicle] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void loadApi.list().then((rows) => {
      if (!active) return
      setLoadCases(rows.map((record) => ({
        tripId: record.tripId,
        version: record.version,
        departure: record.trip ? new Date(record.trip.departureAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
        items: record.items.length,
        priority: "normal",
        route: record.trip?.tripNumber ?? record.tripId,
        state: record.status === "available" ? "available" : record.status === "claimed" || record.status === "loading" || record.status === "reconciled" ? "claimed" : "completed",
        stops: record.trip?.stops.length ?? new Set(record.items.map((item) => item.stopId)).size,
        vehicle: record.trip?.vehicleId ?? "Unassigned",
        weight: `${record.items.reduce((sum, item) => sum + item.expectedQuantity, 0)} units`,
        timing: { receivedAt: Date.now(), departureAt: record.trip ? new Date(record.trip.departureAt).getTime() : Date.now() },
      })))
    }).catch((error) => {
      console.error("Load jobs request failed", error)
      if (import.meta.env.VITE_ALLOW_UNAUTHENTICATED_PROTOTYPE !== "true") setLoadCases([])
    })
    return () => { active = false }
  }, [])

  function applyManifest(record: LoadRecord) {
    const stopMeta = new Map(record.trip?.stops.map((stop) => [stop.stopId, stop]) ?? [])
    const grouped = new Map<string, LoadRecord["items"]>()
    for (const item of record.items) grouped.set(item.stopId, [...(grouped.get(item.stopId) ?? []), item])
    setStops([...grouped.entries()].map(([stopId, items]) => ({
      stopNumber: stopMeta.get(stopId)?.sequence ?? 0,
      outlet: stopMeta.get(stopId)?.outletId ?? stopId,
      deliveryWindow: "Server planned",
      orderId: String(items[0]?.orderId ?? ""),
      items: items.map((item) => ({ id: item.itemId, name: item.name, quantity: String(item.expectedQuantity), status: item.status === "pending" ? "pending" : item.status === "loaded" ? "loaded" : "flagged" })),
    })).sort((a, b) => b.stopNumber - a.stopNumber))
  }

  const activeLoad = loadCases.find((lc) => lc.vehicle === activeVehicle)

  function setActiveVersion(version: number) {
    if (!activeLoad?.tripId) return
    setLoadCases((current) => current.map((item) => item.tripId === activeLoad.tripId ? { ...item, version } : item))
  }

  async function updateLoadedItem(item: LoadItemData) {
    if (!activeLoad?.tripId || activeLoad.version === undefined) return
    const expectedQuantity = Number.parseInt(item.quantity, 10)
    const record = await loadApi.updateItem(activeLoad.tripId, item.id, activeLoad.version, "loaded", expectedQuantity)
    setActiveVersion(record.version)
  }

  async function updateException(item: LoadItemData, exception: LoadItemException) {
    if (!activeLoad?.tripId || activeLoad.version === undefined) return
    const record = await loadApi.exception(activeLoad.tripId, item.id, activeLoad.version, {
      type: exception.type,
      quantity: exception.affectedQuantity,
      reasonCode: exception.reason.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replaceAll(/^_|_$/g, ""),
      note: exception.note,
    })
    setActiveVersion(record.version)
  }

  return (
    <LoadContext.Provider value={{
      loadCases, setLoadCases,
      stops, setStops,
      activeVehicle, setActiveVehicle,
      activeLoad, applyManifest, setActiveVersion, updateLoadedItem, updateException
    }}>
      {children}
    </LoadContext.Provider>
  )
}
