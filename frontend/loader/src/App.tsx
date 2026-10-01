import { useState } from "react"
import ActiveLoadPage from "./pages/ActiveLoadPage.js"
import AvailableWorkPage from "./pages/AvailableWorkPage.js"
import LoadConfirmedPage from "./pages/LoadConfirmedPage.js"
import ReconciliationPage from "./pages/ReconciliationPage.js"
import { loadApi } from "./services/loads.js"
import { LoadProvider, useLoadContext } from "./context/LoadContext.js"

type LoaderView = "available" | "active-load" | "reconciliation" | "confirmed"

const requestedView = new URLSearchParams(window.location.search).get("view")

function resolveInitialView(): LoaderView {
  if (requestedView === "active-load") return "active-load"
  if (requestedView === "reconciliation") return "reconciliation"
  if (requestedView === "confirmed") return "confirmed"
  return "available"
}

function LoaderRouter() {
  const [view, setView] = useState<LoaderView>(resolveInitialView())
  const {
    loadCases, setLoadCases,
    stops, setStops,
    activeVehicle, setActiveVehicle,
    activeLoad, applyManifest, setActiveVersion, updateLoadedItem, updateException
  } = useLoadContext()

  if (view === "available") {
    return (
      <AvailableWorkPage
        loadCases={loadCases}
        setLoadCases={setLoadCases}
        onOpenLoad={(vehicle) => {
          const selected = loadCases.find((loadCase) => loadCase.vehicle === vehicle)
          setActiveVehicle(vehicle)
          if (selected?.tripId && selected.version !== undefined) {
            void loadApi.start(selected.tripId, selected.version).then(async (record) => {
              const detail = await loadApi.detail(selected.tripId!)
              applyManifest({ ...detail, version: record.version })
              setLoadCases((current) => current.map((item) => item.tripId === selected.tripId ? { ...item, version: record.version, state: "claimed" } : item))
              setView("active-load")
            }).catch((error) => console.error("Unable to start loading", error))
          } else setView("active-load")
        }}
      />
    )
  }

  if (view === "active-load") {
    return (
      <ActiveLoadPage
        onBack={() => setView("available")}
        onLoadingAccounted={() => {
          if (!activeLoad?.tripId || activeLoad.version === undefined) {
            setView("reconciliation")
            return
          }
          void loadApi.reconcile(activeLoad.tripId, activeLoad.version).then(({ record }) => {
            setActiveVersion(record.version)
            setView("reconciliation")
          }).catch((error) => console.error("Unable to reconcile load", error))
        }}
        onLoadCompleted={(completionTime) => {
          if (activeLoad && activeLoad.timing && activeLoad.timing.finalVariance === undefined) {
            setLoadCases((current) =>
              current.map((lc) =>
                lc.vehicle === activeVehicle
                  ? {
                      ...lc,
                      timing: lc.timing ? {
                        ...lc.timing,
                        finalVariance: lc.timing.departureAt - completionTime,
                      } : undefined,
                    }
                  : lc
              )
            )
          }
        }}
        stops={stops}
        onStopsChange={setStops}
        activeLoad={activeLoad}
        onMarkItemLoaded={updateLoadedItem}
        onSaveException={updateException}
      />
    )
  }

  if (view === "reconciliation") {
    return (
      <ReconciliationPage
        stops={stops}
        onBack={() => setView("active-load")}
        onConfirmed={async () => {
          if (!activeLoad?.tripId || activeLoad.version === undefined) {
            setView("confirmed")
            return
          }
          try {
            const record = await loadApi.confirm(activeLoad.tripId, activeLoad.version)
            setActiveVersion(record.version)
            setView("confirmed")
          } catch (error) {
            console.error("Unable to confirm load", error)
          }
        }}
        activeLoad={activeLoad}
      />
    )
  }

  return (
    <LoadConfirmedPage
      stops={stops}
      onBackToWork={() => {
        if (activeVehicle) {
          setLoadCases((current) =>
            current.map((lc) =>
              lc.vehicle === activeVehicle
                ? { ...lc, state: "completed" }
                : lc
            )
          )
        }
        setActiveVehicle(null)
        setView("available")
      }}
      activeLoad={activeLoad}
    />
  )
}

export default function App() {
  return (
    <LoadProvider>
      <LoaderRouter />
    </LoadProvider>
  )
}
