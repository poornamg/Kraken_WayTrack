import { useCallback, useEffect, useState } from "react"
import {
  type Order,
  type Vehicle,
  type RouteRecord,
  type Remark,
  type ShopType,
} from "../types"
import {
  initialOrders,
  initialRemarks,
  initialRoutes,
  initialVehicles,
} from "../data"
import { OPEN_ORDER_EVENT, TODAY } from "../constants"
import { planningApi, type DriverReference } from "../services/planning"

export interface UsePlanningStateProps {
  navigate: (path: string) => void
  setToast: (message: string) => void
}

export function usePlanningState({ navigate, setToast }: UsePlanningStateProps) {
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [orderNotices, setOrderNotices] = useState<
    Record<string, { text: string; shareWithCrew: boolean }>
  >({})

  useEffect(() => {
    const onOpen = (e: Event) => setDetailOrder((e as CustomEvent<Order>).detail)
    window.addEventListener(OPEN_ORDER_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_ORDER_EVENT, onOpen)
  }, [])

  const [approved, setApproved] = useState(false)
  const [homeFilter, setHomeFilter] = useState<ShopType | null>(null)
  const [viewDate, setViewDate] = useState(() =>
    new URLSearchParams(window.location.search).get("date") ? 28 : 27,
  )

  const prototypeMode = import.meta.env.VITE_ALLOW_UNAUTHENTICATED_PROTOTYPE === "true"
  const [serviceDate, setServiceDate] = useState(import.meta.env.VITE_SERVICE_DATE ?? "")
  const [availableServiceDates, setAvailableServiceDates] = useState<string[]>([])
  const [planningError, setPlanningError] = useState("")
  const [planningRefreshing, setPlanningRefreshing] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>(prototypeMode ? initialVehicles : [])
  const [drivers, setDrivers] = useState<DriverReference[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState("")
  const [distanceKm, setDistanceKm] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("")
  const [orders, setOrders] = useState<Order[]>(prototypeMode ? initialOrders : [])
  const [allPlanningOrders, setAllPlanningOrders] = useState<Order[]>(prototypeMode ? initialOrders : [])
  const [routes, setRoutes] = useState<RouteRecord[]>(prototypeMode ? initialRoutes : [])
  const [remarks, setRemarks] = useState<Remark[]>(initialRemarks)

  const refreshPlanningData = useCallback(async () => {
    if (prototypeMode) return
    setPlanningRefreshing(true)
    try {
      const allOrders = await planningApi.orders()
      const configuredDate = (import.meta.env.VITE_SERVICE_DATE as string | undefined) || "2026-10-01"
      const dates = [configuredDate]
      setAvailableServiceDates(dates)
      const planningDate = configuredDate
      if (!planningDate) {
        setOrders([])
        setAllPlanningOrders([])
        setVehicles([])
        setDrivers([])
        setPlanningError("")
        return
      }
      if (planningDate !== serviceDate) setServiceDate(planningDate)
      const mappedOrders = allOrders.map((order: any) => ({
        apiId: order.id,
        id: order.id,
        shop: order.storeName,
        town: order.town,
        type: order.type,
        items: order.itemsSummary,
        kg: order.kg,
        emergency: order.emergency,
        inReach: order.inReach,
        suggested: order.suggested,
        dueDay: order.dueDay,
        stop: order.stop,
        deferred: order.status === "Deferred",
        deferredTo: order.deferredTo,
        deferredNotice: order.deferredNotice,
      }))
      setAllPlanningOrders(mappedOrders)
      const apiOrders = [...mappedOrders]
      const [apiVehicles, apiDrivers] = await Promise.all([
        planningApi.vehicles(planningDate),
        planningApi.drivers(),
      ])
      setOrders(apiOrders)
      setVehicles(
        apiVehicles.map((vehicle) => ({
          id: vehicle.vehicleId,
          type:
            vehicle.temperatureClass === "reefer"
              ? "Refrigerated"
              : vehicle.type.toLowerCase() === "van"
              ? "Van"
              : "Lorry",
          capacityKg: vehicle.weightCapacityKg,
          length: `${vehicle.volumeCapacityM3} m³`,
          turns: vehicle.routesToday,
          turnQuota: vehicle.routeLimit,
          km: vehicle.usedDistanceKm,
          kmQuota: Math.round(vehicle.weeklyFuelQuotaL * vehicle.kmPerL),
          fuel:
            vehicle.weeklyFuelQuotaL > 0
              ? Math.max(
                  0,
                  Math.round(
                    (1 - vehicle.usedFuelL / vehicle.weeklyFuelQuotaL) * 100,
                  ),
                )
              : 0,
          volumeM3: vehicle.volumeCapacityM3,
          turnsToday: vehicle.routesToday,
        })),
      )
      setDrivers(apiDrivers)
      if (apiDrivers.length === 1) setSelectedDriverId(apiDrivers[0]._id)
      setPlanningError("")
    } catch (error) {
      setPlanningError(
        error instanceof Error ? error.message : "Unable to refresh the planning queue.",
      )
    } finally {
      setPlanningRefreshing(false)
    }
  }, [prototypeMode, serviceDate])

  useEffect(() => {
    if (prototypeMode) return
    void refreshPlanningData()
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshPlanningData()
    }
    const interval = window.setInterval(refreshWhenVisible, 15_000)
    window.addEventListener("focus", refreshWhenVisible)
    document.addEventListener("visibilitychange", refreshWhenVisible)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", refreshWhenVisible)
      document.removeEventListener("visibilitychange", refreshWhenVisible)
    }
  }, [prototypeMode, refreshPlanningData])

  const [manageVehiclesOpen, setManageVehiclesOpen] = useState(false)
  const [deferOpen, setDeferOpen] = useState(false)

  const datePlusDays = (date: string, days: number) => {
    const value = new Date(`${date}T00:00:00Z`)
    value.setUTCDate(value.getUTCDate() + days)
    return value.toISOString().slice(0, 10)
  }

  const publishSchedule = async (
    scheduled: Order[],
    vehicle: Vehicle,
    targetDate: string,
    departureTime: string,
  ) => {
    const liveOrders = scheduled.filter((order): order is Order & { apiId: string } =>
      Boolean(order.apiId),
    )

    for (const order of liveOrders) {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}/api/v1/unified/orders/${order.apiId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Scheduled",
            stop: scheduled.indexOf(order) + 1,
          }),
        },
      )
    }
  }

  const finishSchedule = (message: string, scheduled: Order[], day?: number) => {
    navigate("/home")
    setToast(message)
    setOrders((prev) => {
      const ids = scheduled.map((o) => o.id)
      const updated = prev.map((o) =>
        ids.includes(o.id)
          ? { ...o, stop: ids.indexOf(o.id) + 1, dueDay: o.dueDay ?? day }
          : o,
      )
      const missing = scheduled
        .filter((o) => !prev.some((p) => p.id === o.id))
        .map((o) => ({ ...o, stop: ids.indexOf(o.id) + 1, dueDay: day }))
      return [...updated, ...missing]
    })
  }

  const completeSchedule = async (
    message: string,
    scheduled: Order[],
    vehicle: Vehicle,
    routeDate: string,
    departureTime: string,
  ) => {
    try {
      const targetDate =
        prototypeMode && routeDate.includes("28")
          ? datePlusDays(serviceDate, 1)
          : serviceDate
      await publishSchedule(scheduled, vehicle, targetDate, departureTime)
      finishSchedule(message, scheduled)
    } catch (error) {
      setToast(
        error instanceof Error ? error.message : "The route could not be published.",
      )
    }
  }

  const completeImmediate = async (
    message: string,
    scheduled: Order[],
    day: number,
    vehicle: Vehicle,
    departureTime: string,
  ) => {
    try {
      const targetDate = prototypeMode
        ? datePlusDays(serviceDate, Math.max(0, day - TODAY))
        : serviceDate
      await publishSchedule(scheduled, vehicle, targetDate, departureTime)
      finishSchedule(message, scheduled, day)
    } catch (error) {
      setToast(
        error instanceof Error ? error.message : "The route could not be published.",
      )
    }
  }

  const completeApproval = (message: string) => {
    setApproved(true)
    navigate("/home")
    setToast(message)
  }

  const handleDeferOrders = async (
    selectedIds: string[],
    deferTo: string,
    reasons: string[],
    notice: string,
  ) => {
    const selected = orders.filter((order) => selectedIds.includes(order.id))
    try {
      const apiIds = selected
        .map((order) => order.apiId)
        .filter((id): id is string => Boolean(id))
      for (const apiId of apiIds) {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}/api/v1/unified/orders/${apiId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "Deferred",
              deferred: true,
              deferredTo: deferTo,
              deferredNotice: notice,
              dueDay: 28,
            }),
          },
        )
      }
    } catch (error) {
      setToast(
        error instanceof Error ? error.message : "The orders could not be deferred.",
      )
      return
    }
    setOrders((prev) =>
      prev.map((o) =>
        selectedIds.includes(o.id)
          ? {
              ...o,
              deferred: true,
              deferredTo: deferTo,
              deferredNotice: notice,
              dueDay: 28,
            }
          : o,
      ),
    )
    setDeferOpen(false)
    setToast(`${selectedIds.length} orders deferred to ${deferTo.split(" · ")[0]}`)
  }

  const handleUpdateVehicles = (updated: Vehicle[]) => {
    setVehicles(updated)
    setManageVehiclesOpen(false)
    setToast("Weekly quota updated")
  }

  return {
    approved,
    setApproved,
    homeFilter,
    setHomeFilter,
    viewDate,
    setViewDate,
    prototypeMode,
    serviceDate,
    setServiceDate,
    availableServiceDates,
    planningError,
    planningRefreshing,
    vehicles,
    setVehicles,
    drivers,
    selectedDriverId,
    setSelectedDriverId,
    distanceKm,
    setDistanceKm,
    durationMinutes,
    setDurationMinutes,
    orders,
    setOrders,
    allPlanningOrders,
    routes,
    remarks,
    setRemarks,
    detailOrder,
    setDetailOrder,
    orderNotices,
    setOrderNotices,
    manageVehiclesOpen,
    setManageVehiclesOpen,
    deferOpen,
    setDeferOpen,
    refreshPlanningData,
    completeSchedule,
    completeImmediate,
    completeApproval,
    handleDeferOrders,
    handleUpdateVehicles,
  }
}
