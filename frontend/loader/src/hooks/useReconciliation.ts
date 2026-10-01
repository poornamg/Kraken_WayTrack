import type { ActiveStop } from "../data/mock-data.js"

export function useReconciliation(stops: ActiveStop[]) {
  const allItems = stops.flatMap((stop) => stop.items)
  const total = allItems.length
  const loadedCount = allItems.filter((i) => i.status === "loaded").length
  const flaggedCount = allItems.filter((i) => i.status === "flagged").length
  const pendingCount = allItems.filter((i) => i.status === "pending").length
  const accountedCount = loadedCount + flaggedCount

  // Invariant: Loaded + Flagged + Pending = Total
  const canConfirm = pendingCount === 0

  const flaggedItems = stops.flatMap((stop) =>
    stop.items
      .filter((item) => item.status === "flagged")
      .map((item) => ({ item, stop })),
  )

  const stopSummaries = stops.map((stop) => {
    const pending = stop.items.filter((i) => i.status === "pending").length
    const flagged = stop.items.filter((i) => i.status === "flagged").length
    const loaded = stop.items.filter((i) => i.status === "loaded").length
    const isComplete = pending === 0
    return { stop, isComplete, loaded, flagged, pending }
  })

  return {
    total,
    loadedCount,
    flaggedCount,
    pendingCount,
    accountedCount,
    canConfirm,
    flaggedItems,
    stopSummaries
  }
}
