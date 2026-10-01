import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { Check } from "lucide-react"
import { navigation } from ".//navigation"

export function BottomNavigation({
  current,
  onNavigate,
}: {
  current: string
  onNavigate: (label: string) => void
}) {
  const tabIndex = navigation.findIndex((n) => n.label === current)
  const lastValidIndex = useRef(0)
  if (tabIndex >= 0) {
    lastValidIndex.current = tabIndex
  }
  const currentIndex = tabIndex >= 0 ? tabIndex : lastValidIndex.current

  const [visualIndex, setVisualIndex] = useState(currentIndex)

  const navRef = useRef<HTMLElement>(null)
  const didDragRef = useRef(false)
  const dragStartRef = useRef<{ x: number; y: number; active: boolean; magneticIndex: number } | null>(null)
  
  const baseLeft = useMotionValue(0)
  const baseRight = useMotionValue(0)
  const dragOffsetLeft = useMotionValue(0)
  const dragOffsetRight = useMotionValue(0)
  
  const indicatorLeft = useTransform([baseLeft, dragOffsetLeft], ([b, d]) => (b as number) + (d as number))
  const indicatorRight = useTransform([baseRight, dragOffsetRight], ([b, d]) => (b as number) + (d as number))
  
  const indicatorCenter = useTransform([indicatorLeft, indicatorRight], ([l, r]) => ((l as number) + (r as number)) / 2)
  const indicatorWidth = useTransform([indicatorLeft, indicatorRight], ([l, r]) => (r as number) - (l as number))

  useEffect(() => {
    return indicatorCenter.on("change", (latest) => {
      // NOTE: Removed early return if dragging, so visualIndex can update during continuous swipe!
      if (navRef.current) {
        const slotWidth = navRef.current.getBoundingClientRect().width / 3
        if (slotWidth > 0) {
          const currentVisual = Math.floor(latest / slotWidth)
          if (currentVisual === currentIndex && currentVisual >= 0 && currentVisual <= 2) {
            setVisualIndex(prev => prev === currentVisual ? prev : currentVisual)
          }
        }
      }
    })
  }, [indicatorCenter, currentIndex])

  const leadingSpring = { type: "spring" as const, stiffness: 500, damping: 34, mass: 0.45 }
  const trailingSpring = { type: "spring" as const, stiffness: 420, damping: 30, mass: 0.65 }
  const magneticSpring = { type: "spring" as const, stiffness: 600, damping: 32, mass: 0.45 }
  
  const prevIndexRef = useRef(currentIndex)

  // Sync base indicator when current tab changes
  useEffect(() => {
    if (navRef.current) {
      const slotWidth = navRef.current.getBoundingClientRect().width / 3
      const inset = 8
      const targetLeft = currentIndex * slotWidth + inset
      const targetRight = (currentIndex + 1) * slotWidth - inset

      if (baseRight.get() === 0) {
        // Initial setup
        baseLeft.set(targetLeft)
        baseRight.set(targetRight)
        prevIndexRef.current = currentIndex
        return
      }

      const prevIndex = prevIndexRef.current
      prevIndexRef.current = currentIndex
      
      const isDragging = dragStartRef.current?.active

      if (currentIndex === prevIndex) {
        animate(baseLeft, targetLeft, trailingSpring)
        animate(baseRight, targetRight, trailingSpring)
      } else if (currentIndex > prevIndex) {
        // Forward stretch
        animate(baseRight, targetRight, isDragging ? magneticSpring : leadingSpring)
        animate(baseLeft, targetLeft, isDragging ? { ...magneticSpring, delay: 0.03 } : { ...trailingSpring, delay: 0.05 })
      } else {
        // Backward stretch
        animate(baseLeft, targetLeft, isDragging ? magneticSpring : leadingSpring)
        animate(baseRight, targetRight, isDragging ? { ...magneticSpring, delay: 0.03 } : { ...trailingSpring, delay: 0.05 })
      }
    }
  }, [currentIndex, baseLeft, baseRight])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!navRef.current) return
    didDragRef.current = false
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      active: false,
      magneticIndex: currentIndex
    }
    // zero offsets for clean state
    dragOffsetLeft.set(0)
    dragOffsetRight.set(0)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current || !navRef.current) return
    const deltaX = e.clientX - dragStartRef.current.x
    const deltaY = e.clientY - dragStartRef.current.y
    
    if (!dragStartRef.current.active) {
      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
        dragStartRef.current.active = true
        didDragRef.current = true
      }
    }
    
    if (dragStartRef.current.active) {
      e.preventDefault() // prevent scrolling while dragging horizontally
      const slotWidth = navRef.current.getBoundingClientRect().width / 3
      const threshold = slotWidth * 0.42 // ~42% of slot width to trigger snap
      
      // Check magnetic thresholds
      if (deltaX > threshold && dragStartRef.current.magneticIndex < 2) {
        dragStartRef.current.magneticIndex += 1
        dragStartRef.current.x = e.clientX
        onNavigate(navigation[dragStartRef.current.magneticIndex].label)
        dragOffsetLeft.set(0)
        dragOffsetRight.set(0)
        return
      } else if (deltaX < -threshold && dragStartRef.current.magneticIndex > 0) {
        dragStartRef.current.magneticIndex -= 1
        dragStartRef.current.x = e.clientX
        onNavigate(navigation[dragStartRef.current.magneticIndex].label)
        dragOffsetLeft.set(0)
        dragOffsetRight.set(0)
        return
      }
      
      // Calculate resistant stretch
      const maxDragOffset = 22 // maximum pixels the pill can stretch before snapping
      const sign = Math.sign(deltaX)
      const absDelta = Math.abs(deltaX)
      const resistantOffset = sign * maxDragOffset * (1 - Math.exp(-absDelta / 30))
      
      let lOff = 0
      let rOff = 0
      
      if (deltaX > 0) {
        rOff = resistantOffset
        lOff = resistantOffset * 0.35 // trailing edge resists heavily
      } else {
        lOff = resistantOffset
        rOff = resistantOffset * 0.35 // trailing edge resists heavily
      }
      
      dragOffsetLeft.set(lOff)
      dragOffsetRight.set(rOff)
    }
  }

  const handlePointerUp = () => {
    if (!dragStartRef.current || !navRef.current) return
    
    if (dragStartRef.current.active) {
      // Finger released.
      // Animate offsets cleanly back to 0. Base handles the actual resting position.
      const springBack = { type: "spring" as const, stiffness: 600, damping: 32, mass: 0.45 }
      animate(dragOffsetLeft, 0, springBack)
      animate(dragOffsetRight, 0, springBack)
    }
    
    dragStartRef.current = null
  }

  return (
    <nav 
      className="bottom-nav" 
      aria-label="Mobile navigation" 
      style={{ touchAction: "pan-y" }}
      ref={navRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <motion.div
        className="bottom-nav-active-indicator"
        style={{
          position: "absolute",
          top: 4,
          bottom: "calc(4px + env(safe-area-inset-bottom))",
          left: indicatorLeft,
          width: indicatorWidth,
          zIndex: 0,
          boxSizing: "border-box",
          pointerEvents: "none",
          background: "var(--cobalt-50)",
          borderRadius: "var(--radius-sm)"
        }}
      />
      {navigation.map(({ label, icon: Icon }, index) => (
        <button
          className={`bottom-nav-item ${
            visualIndex === index ? "bottom-nav-item--selected" : ""
          }`}
          key={label}
          onClick={(e) => {
            if (didDragRef.current) {
              e.preventDefault()
              e.stopPropagation()
              didDragRef.current = false
              return
            }
            onNavigate(label)
          }}
          type="button"
          style={{ flex: 1, zIndex: 1 }}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}


