import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { ChevronDown, Home } from "lucide-react"
import { calmSpring } from "../constants/springs"
import { FloatingNewOrder } from "../components/layout/FloatingNewOrder"
import { AttentionCard } from "../components/home/AttentionCard"
import { HomeSectionHeader } from "../components/home/HomeSectionHeader"
import { NextDeliveryHero } from "../components/home/NextDeliveryHero"
import { UpcomingDeliveryRow } from "../components/home/UpcomingDeliveryRow"
import { RecentActivityList } from "../components/home/RecentActivityList"
import { UpcomingEmptyState } from "../components/home/UpcomingEmptyState"
import { getUpcomingDeliveries } from "../data/mockData"

export function HomePage({
  showAttention = true,
  afterCutoff = false,
  showUpcoming = true,
  onNewOrder,
  onOpenDeferred,
  business,
  onOpenOrder,
  onBusinessChange,
  onNavigate,
}: {
  showAttention?: boolean
  afterCutoff?: boolean
  showUpcoming?: boolean
  onNewOrder: () => void
  onOpenDeferred: () => void
  business: "fresh" | "style" | "tech"
  onOpenOrder: (id: string, view: string, state: string) => void
  onBusinessChange?: (b: "fresh" | "style" | "tech") => void
  onNavigate: (label: string) => void
}) {
  return (
    <div className="home-page">
      <div className="home-page-header">
        <div>
          <span className="home-greeting">Good morning, Dilini</span>
          <div className="page-title">Home</div>
          <p>Here's what's happening at your store today.</p>
        </div>
        
      </div>

      {business && onBusinessChange && (
        <div className="prototype-state-control" style={{ marginBottom: 24 }}>
          <span className="prototype-only-label">Prototype only</span>
          <label style={{ gridColumn: "1 / -1" }}>
            <span>Outlet type</span>
            <span className="prototype-select-wrap">
              <select
                value={business}
                onChange={(event) => onBusinessChange(event.target.value as "fresh" | "style" | "tech")}
              >
                <option value="fresh">Waypoint Fresh</option>
                <option value="style">Waypoint Style</option>
                <option value="tech">Waypoint Tech</option>
              </select>
              <ChevronDown />
            </span>
          </label>
        </div>
      )}
      

      

      

      <motion.section className="home-section" layout transition={calmSpring}>
        <HomeSectionHeader title="Next delivery" />
        <NextDeliveryHero business={business} onOpen={() => onOpenOrder("ORD-1062", "order-detail", "scheduled")} />
      </motion.section>

<AnimatePresence initial={false}>
        {showAttention && (
          <motion.section
            className="home-section attention-section"
            layout
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={calmSpring}
          >
            <HomeSectionHeader title="Needs attention" />
            <AttentionCard onOpen={() => onOpenOrder("ORD-1045", "verify-delivery", "verify")} />
          </motion.section>
        )}
      </AnimatePresence>

      <motion.div className="home-bottom-grid" layout transition={calmSpring}>
        <section className="home-panel upcoming-panel">
          <HomeSectionHeader title="Upcoming deliveries" action="View all" onAction={() => onNavigate("Orders")} />
          <AnimatePresence mode="wait" initial={false}>
            {showUpcoming ? (
              <motion.div
                className="upcoming-list"
                key="upcoming-list"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={calmSpring}
              >
                {getUpcomingDeliveries(business || "fresh").map((delivery) => (
                  <UpcomingDeliveryRow business={business}
                    delivery={delivery}
                    key={delivery.id}
                    onOpen={
                      delivery.id === "ORD-1065" ? onOpenDeferred : undefined
                    }
                  />
                ))}
              </motion.div>
            ) : (
              <UpcomingEmptyState key="upcoming-empty" />
            )}
          </AnimatePresence>
        </section>

        <section className="home-panel activity-panel">
          <HomeSectionHeader title="Recent activity" action="View all" onAction={() => onNavigate("Deliveries")} />
          <RecentActivityList />
        </section>
      </motion.div>
      <FloatingNewOrder onClick={onNewOrder} />
    </div>
  )
}










