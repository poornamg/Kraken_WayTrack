import { useMemo } from "react"

export function useCutoff(prototypeState?: string | null) {
  const afterCutoff = prototypeState === "after-cutoff" || prototypeState === "full"

  const cutoffInfo = useMemo(() => {
    return {
      afterCutoff,
      cutoffTime: "15:00",
      orderDate: "Thursday, 1 October",
      nextDeliveryDate: afterCutoff ? "Friday, 2 October" : "Thursday, 1 October",
      badgeText: afterCutoff ? "Order cutoff passed" : "Order cutoff 15:00",
      helperText: afterCutoff
        ? "Orders placed now will be planned for next operating cycle."
        : "Standard daily delivery window closes at 15:00.",
    }
  }, [afterCutoff])

  return cutoffInfo
}
