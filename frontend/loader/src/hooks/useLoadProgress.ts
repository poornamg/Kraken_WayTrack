import { useState, useRef, useEffect } from "react"
import type { ActiveStop, LoadCase } from "../data/mock-data.js"
import type { LoadItemData, LoadItemException } from "../components/active-load/LoadItem.js"

interface UseLoadProgressProps {
  stops: ActiveStop[]
  onStopsChange: (stops: ActiveStop[]) => void
  activeLoad?: LoadCase
  onLoadCompleted?: (completionTime: number) => void
  onMarkItemLoaded?: (item: LoadItemData) => Promise<void>
  onSaveException?: (item: LoadItemData, exception: LoadItemException) => Promise<void>
}

export function useLoadProgress({
  stops,
  onStopsChange,
  activeLoad,
  onLoadCompleted,
  onMarkItemLoaded,
  onSaveException
}: UseLoadProgressProps) {
  const [visibleStopIndex, setVisibleStopIndex] = useState(0)
  const [exceptionItemId, setExceptionItemId] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState<{ detail: string, pendingSync: boolean } | null>(null)
  const [reconciliationReady, setReconciliationReady] = useState(false)
  const [slideDirection, setSlideDirection] = useState<"none" | "slide-left" | "slide-right">("none")
  
  const slideTimerRef = useRef<number | null>(null)

  const allItems = stops.flatMap((stop) => stop.items)
  const loadedCount = allItems.filter((item) => item.status === "loaded").length
  const flaggedCount = allItems.filter((item) => item.status === "flagged").length
  const pendingCount = allItems.filter((item) => item.status === "pending").length
  const accountedCount = loadedCount + flaggedCount
  const allItemsAccounted = accountedCount === allItems.length
  const globallyComplete = pendingCount === 0

  const nextRequiredStopIndex = stops.findIndex((stop) =>
    stop.items.some((item) => item.status === "pending")
  )

  useEffect(() => {
    if (globallyComplete && activeLoad && activeLoad.timing.finalVariance === undefined && onLoadCompleted) {
      onLoadCompleted(Date.now())
    }
  }, [globallyComplete, activeLoad, onLoadCompleted])

  const visibleStop = stops[visibleStopIndex]
  const visiblePending = visibleStop?.items.filter((item) => item.status === "pending").length ?? 0
  const exceptionItem = allItems.find((item) => item.id === exceptionItemId) ?? null

  function isStopComplete(stopIndex: number) {
    if (!stops[stopIndex]) return false;
    return stops[stopIndex].items.every((item) => item.status !== "pending")
  }

  function triggerSlide(dir: "slide-left" | "slide-right", executeMove: () => void) {
    setSlideDirection(dir)
    if (slideTimerRef.current !== null) window.clearTimeout(slideTimerRef.current)
    slideTimerRef.current = window.setTimeout(() => {
      executeMove()
      setSlideDirection("none")
    }, 250)
  }

  const prevNextRequired = useRef(nextRequiredStopIndex)

  useEffect(() => {
    const prev = prevNextRequired.current
    prevNextRequired.current = nextRequiredStopIndex

    if (
      prev !== -1 &&
      nextRequiredStopIndex > prev &&
      visibleStopIndex === prev &&
      !globallyComplete &&
      nextRequiredStopIndex !== -1
    ) {
      const advanceTimer = setTimeout(() => {
        triggerSlide("slide-left", () => setVisibleStopIndex(nextRequiredStopIndex))
      }, 500)
      return () => clearTimeout(advanceTimer)
    }
  }, [nextRequiredStopIndex, visibleStopIndex, globallyComplete])

  function updateItems(updater: (items: LoadItemData[]) => LoadItemData[]) {
    onStopsChange(
      stops.map((stop, idx) =>
        idx === visibleStopIndex
          ? { ...stop, items: updater(stop.items) }
          : stop
      )
    )
  }

  async function markItemLoaded(itemId: string) {
    const item = visibleStop.items.find(i => i.id === itemId)
    if (item && onMarkItemLoaded) await onMarkItemLoaded(item)
    updateItems((items) =>
      items.map((i) => (i.id === itemId ? { ...i, status: "loaded" } : i))
    )
  }

  async function saveException(exception: LoadItemException) {
    const item = visibleStop.items.find(i => i.id === exceptionItemId)
    if (item && onSaveException) await onSaveException(item, exception)
    updateItems((items) =>
      items.map((i) =>
        i.id === exceptionItemId
          ? { ...i, status: "flagged", exception }
          : i
      )
    )
    setExceptionItemId(null)
    setSavedNotice({
      detail: `${exception.affectedQuantity} ${exception.type} logged`,
      pendingSync: exception.pendingSync,
    })
    setTimeout(() => setSavedNotice(null), 3000)
  }

  function handlePrevStop() {
    if (visibleStopIndex > 0) {
      triggerSlide("slide-right", () => setVisibleStopIndex(visibleStopIndex - 1))
    }
  }

  function handleNextStop() {
    if (visibleStopIndex < stops.length - 1) {
      triggerSlide("slide-left", () => setVisibleStopIndex(visibleStopIndex + 1))
    }
  }

  return {
    visibleStopIndex, setVisibleStopIndex,
    exceptionItemId, setExceptionItemId,
    savedNotice, setSavedNotice,
    reconciliationReady, setReconciliationReady,
    slideDirection,
    allItems, loadedCount, flaggedCount, pendingCount, accountedCount, allItemsAccounted, globallyComplete,
    visibleStop, visiblePending, exceptionItem,
    isStopComplete, triggerSlide, updateItems, markItemLoaded, saveException, handlePrevStop, handleNextStop,
    nextRequiredStopIndex
  }
}
