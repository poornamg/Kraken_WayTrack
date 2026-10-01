import { useEffect, useState } from "react"

export function useBreakpoint(breakpointWidth = 1024) {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth < breakpointWidth
  })

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpointWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [breakpointWidth])

  return { isMobile, isDesktop: !isMobile }
}
