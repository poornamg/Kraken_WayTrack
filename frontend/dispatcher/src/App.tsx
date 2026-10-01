import { useEffect, useState } from "react"
import { AppShell } from "./components/layout"
import { HomePage, SchedulePage, DueSchedulePage, MonitorPage } from "./pages"
import { OrderLogPage } from "./components/OrderLogPage"
import { DeferModal } from "./components/DeferModal"
import { ManageVehiclesModal } from "./components/ManageVehiclesModal"
import { OrderDetailsModal } from "./components/OrderDetailsModal"
import { usePlanningState } from "./hooks"
import { DAILY_TURN_LIMIT } from "./constants"
import { getInitialPath } from "./routes"
import { vehicleDay } from "./domain"
import { openOrderDetails } from "./utils"
import type { Order } from "./types"

export default function App() {
  const [path, setPath] = useState(getInitialPath)
  const [search, setSearch] = useState(() => window.location.search)
  const [toast, setToast] = useState("")

  useEffect(() => {
    if (window.location.pathname === "/") {
      window.history.replaceState({}, "", "/home")
    }
    const onPopState = () => {
      setPath(getInitialPath())
      setSearch(window.location.search)
      planning.setViewDate(
        new URLSearchParams(window.location.search).get("date") ? 28 : 27,
      )
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  const navigate = (nextPath: string) => {
    window.history.pushState({}, "", nextPath)
    setPath(getInitialPath())
    setSearch(window.location.search)
    setToast("")
  }

  const planning = usePlanningState({ navigate, setToast })

  return (
    <AppShell navigate={navigate} path={path}>
      {path === "/schedule" && !planning.prototypeMode ? (
        <div style={{ display: "flex", gap: 16, alignItems: "end", padding: "16px 24px", background: "white", borderBottom: "1px solid var(--navy-100)" }}>
          <label style={{ display: "grid", gap: 6 }}><span>Planning date</span><select value={planning.serviceDate} onChange={(e) => planning.setServiceDate(e.target.value)}>{planning.availableServiceDates.map((date) => <option key={date} value={date}>{date}</option>)}</select></label>
          <label style={{ display: "grid", gap: 6, minWidth: 260 }}><span>Assigned driver</span><select value={planning.selectedDriverId} onChange={(e) => planning.setSelectedDriverId(e.target.value)}><option value="">Select a driver</option>{planning.drivers.map((driver) => <option key={driver._id} value={driver._id}>{driver.name} · {driver.employeeId}</option>)}</select></label>
          <label style={{ display: "grid", gap: 6 }}><span>Planned distance (km)</span><input min="0.1" step="0.1" type="number" value={planning.distanceKm} onChange={(e) => planning.setDistanceKm(e.target.value)} /></label>
          <label style={{ display: "grid", gap: 6 }}><span>Planned duration (minutes)</span><input min="1" step="1" type="number" value={planning.durationMinutes} onChange={(e) => planning.setDurationMinutes(e.target.value)} /></label>
          <button disabled={planning.planningRefreshing} onClick={() => void planning.refreshPlanningData()} type="button">{planning.planningRefreshing ? "Refreshing…" : "Refresh orders"}</button>
          {planning.planningError ? <span role="alert" style={{ color: "var(--critical-500)" }}>{planning.planningError}</span> : null}
        </div>
      ) : null}

      {path === "/schedule" && ["immediate", "due"].includes(new URLSearchParams(search).get("mode") ?? "") ? (
        <DueSchedulePage
          day={new URLSearchParams(search).get("mode") === "immediate" ? 27 : Number((new URLSearchParams(search).get("date") ?? "2026-09-27").slice(8, 10)) || 27}
          key={search}
          onOpenDefer={() => planning.setDeferOpen(true)}
          onOpenManageVehicles={() => planning.setManageVehiclesOpen(true)}
          onOpenNormal={() => navigate("/schedule")}
          onScheduled={planning.completeImmediate}
          orders={planning.orders}
          vehicles={planning.vehicles}
        />
      ) : path === "/schedule" ? (
        <SchedulePage
          key={search}
          navigateHome={planning.completeSchedule}
          onOpenDefer={() => planning.setDeferOpen(true)}
          onOpenManageVehicles={() => planning.setManageVehiclesOpen(true)}
          orders={planning.orders}
          serviceDate={planning.serviceDate}
          setOrders={planning.setOrders}
          setVehicles={planning.setVehicles}
          vehicles={planning.vehicles}
        />
      ) : path === "/orders" ? (
        <OrderLogPage
          onOpenOrder={(entry) =>
            openOrderDetails(
              planning.orders.find((o) => o.id === entry.id) ??
              ({
                id: entry.id,
                shop: entry.shop,
                town: entry.town,
                type: entry.type,
                items: entry.items,
                kg: entry.kg,
                emergency: false,
                inReach: true,
                suggested: false,
                dueDay: entry.day,
                stop: entry.stop === "—" ? undefined : Number(entry.stop),
                deferred: entry.status === "Deferred",
              } as Order),
            )
          }
          orders={planning.orders}
        />
      ) : path.startsWith("/monitor/") ? (
        <MonitorPage
          onApprove={planning.completeApproval}
          remarks={planning.remarks}
          setRemarks={planning.setRemarks}
        />
      ) : (
        <HomePage
          approved={planning.approved}
          calendarOrders={planning.prototypeMode ? undefined : planning.allPlanningOrders}
          error={planning.prototypeMode ? undefined : planning.planningError}
          filter={planning.homeFilter}
          navigate={navigate}
          onDateChange={planning.prototypeMode ? undefined : planning.setServiceDate}
          onRefresh={planning.prototypeMode ? undefined : () => void planning.refreshPlanningData()}
          orders={planning.orders}
          refreshing={planning.prototypeMode ? undefined : planning.planningRefreshing}
          routes={planning.routes}
          serviceDate={planning.prototypeMode ? undefined : planning.serviceDate}
          setFilter={planning.setHomeFilter}
          setViewDate={planning.setViewDate}
          toast={toast}
          viewDate={planning.viewDate}
        />
      )}

      {planning.deferOpen ? (
        <DeferModal
          onClose={() => planning.setDeferOpen(false)}
          onDefer={planning.handleDeferOrders}
          orders={planning.orders.filter((o) => !o.deferred)}
        />
      ) : null}

      {planning.manageVehiclesOpen ? (
        <ManageVehiclesModal
          dailyTurnLimit={DAILY_TURN_LIMIT}
          turnsToday={Object.fromEntries(planning.vehicles.map((v) => [v.id, vehicleDay(v).turnsToday]))}
          volumes={Object.fromEntries(planning.vehicles.map((v) => [v.id, vehicleDay(v).volumeM3]))}
          onClose={() => planning.setManageVehiclesOpen(false)}
          onSubmit={planning.handleUpdateVehicles}
          vehicles={planning.vehicles}
        />
      ) : null}

      {planning.detailOrder ? (
        <OrderDetailsModal
          key={planning.detailOrder.id}
          notice={planning.orderNotices[planning.detailOrder.id]}
          onClose={() => planning.setDetailOrder(null)}
          onSaveNotice={(text: string, shareWithCrew: boolean) => {
            if (!planning.detailOrder) return
            planning.setOrderNotices((prev) => ({
              ...prev,
              [planning.detailOrder!.id]: { text, shareWithCrew },
            }))
            setToast(`Notice saved for ${planning.detailOrder.id}`)
          }}
          order={planning.orders.find((o) => o.id === planning.detailOrder!.id) ?? planning.detailOrder}
        />
      ) : null}
    </AppShell>
  )
}
