import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { AlertTriangle, ArrowLeft, CircleAlert, Clock3, Home } from "lucide-react"
import { calmSpring } from "../constants/springs"
import { Button } from "../components/ui/Button"
import { StatusPill } from "../components/ui/StatusPill"
import { ReviewProductList } from "../components/review/ReviewProductList"
import { OrderDetailLifecycle } from "../components/order-detail/OrderDetailLifecycle"
import { OrderDetailHero } from "../components/order-detail/OrderDetailHero"
import { OrderActivity } from "../components/order-detail/OrderActivity"
import { PrototypeStateControl } from "../components/order-detail/PrototypeStateControl"
import { WarehouseIssueWarning } from "../components/order-detail/WarehouseIssueWarning"
import type { StatusKind, OrderDetailState } from "../types/index"
import { mockDrafts } from "../types/index"
import { formatOutlet, formatOrderType, getDefaultOrderType, selectedProducts } from "../utils/index"
import { getDraft } from "../data/mockData"
import { listStoreOrders } from "../services/store"

export function OrderDetailPage({
  orderId = "ORD-1082",
  business,
  state,
  onBack,
  onStateChange,
  onReviewDelivery,
  onBusinessChange,
  onSimulatePin,
  onNavigateDeferred,
}: {
  orderId?: string
  business: "fresh" | "style" | "tech"
  state: OrderDetailState
  onBack: () => void
  onStateChange: (state: OrderDetailState) => void
  onReviewDelivery: () => void
    onOpenOrder: (id: string, view: string, state: string) => void
    onBusinessChange?: (b: "fresh" | "style" | "tech") => void
  onSimulatePin?: () => void
  onNavigateDeferred: () => void
}) {
  
  const [warehouseIssue, setWarehouseIssue] = useState(false)
  const [wasDeferred, setWasDeferred] = useState(state === "deferred")
  const [realOrder, setRealOrder] = useState<any>(null)
  
  useEffect(() => {
    if (!orderId) return
    listStoreOrders(business).then(orders => {
      const match = orders.find(o => String(o.id) === orderId || String(o._id) === orderId);
      if (match) setRealOrder(match);
    }).catch(console.error)
  }, [orderId, business])
  
  useEffect(() => {
    if (state === "deferred") setWasDeferred(true)
  }, [state])

  const statusKind: Record<OrderDetailState, StatusKind> = {
    deferred: "deferred",
    confirmed: "confirmed",
    scheduled: "scheduled",
    "on-way": "transit",
    arrived: "arrived",
    
    "awaiting-confirmation": "awaiting",
    "receipt-confirmed": "received",
    "receipt-issue": "issue",
  }
  const items = selectedProducts(business, getDefaultOrderType(business || "fresh"), getDraft(mockDrafts[business], getDefaultOrderType(business || "fresh")))
  const showAction = state === "awaiting-confirmation"
    const stateOptions: Array<{
      value: string
      label: string
    }> = [
      { value: "confirmed", label: "Order confirmed" },
      { value: "deferred", label: "Deferred" },
      { value: "scheduled", label: "Scheduled" },
      { value: "on-way", label: "On the way" },
      { value: "on-way-issue", label: "On the way (Warehouse issue)" },
      { value: "arrived", label: "Arrived" },
      { value: "awaiting-confirmation", label: "Awaiting confirmation" },
      { value: "receipt-confirmed", label: "Receipt confirmed" },
      { value: "receipt-issue", label: "Receipt confirmed with issue" },
    ]

  const activeOptions = stateOptions.filter(o => {
    if (o.value === "on-way-issue") return false;
    if (o.value === "deferred" && state !== "confirmed" && state !== "deferred") return false;
    return true;
  });

  return (
    <div className="order-detail-page">
      <div className="order-detail-utility-row">
        <button className="order-back-link" type="button" onClick={onBack}>
          <ArrowLeft />
          Back to Home
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <PrototypeStateControl
              value={state}
              options={activeOptions}
              onChange={(val) => {
                onStateChange(val as OrderDetailState)
              }}
              onSimulatePin={onSimulatePin}
            />

            {state === "on-way" && (
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", background: "var(--slate-50)", padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)" }}>
                <input 
                  type="checkbox" 
                  checked={warehouseIssue} 
                  onChange={(e) => setWarehouseIssue(e.target.checked)} 
                />
                Simulate warehouse issue
              </label>
            )}
          </div>
      </div>

      <div className="order-detail-header">
        <div>
          <div className="order-detail-title-row">
            <div className="page-title data-title">{orderId}</div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={state}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <StatusPill kind={statusKind[state]} />
              </motion.div>
            </AnimatePresence>
          </div>
          <p>{formatOrderType(business || "fresh", getDefaultOrderType(business || "fresh"))} · {formatOutlet(business)}</p>
        </div>
      </div>

      <OrderDetailLifecycle state={state} wasDeferred={wasDeferred} />

      <div className="order-detail-layout">
        <div className="order-detail-primary">
          
          
          


          <OrderDetailHero state={state} onReviewDelivery={onReviewDelivery} onConfirmArrived={() => onStateChange("awaiting-confirmation")} pin={realOrder?.deliveryPin} eta={realOrder?.eta} />

{state === "deferred" && (
            <motion.div className="delivery-update-card" style={{ marginTop: -16, marginBottom: 24 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={calmSpring}>
              <div className="order-detail-section-heading">
                <div>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CircleAlert size={16} /> Delivery deferred
                  </span>
                  <small>No action required.</small>
                </div>
              </div>
              <div className="delivery-update-grid">
                <span>
                  <small>Original plan</small>
                  <strong>Thursday, 1 October</strong>
                </span>
                <span className="delivery-update-new">
                  <small>New expected delivery</small>
                  <strong>Friday, 2 October</strong>
                </span>
                <span>
                  <small>Reason</small>
                  <strong>{business === "fresh" ? "Refrigerated delivery capacity unavailable" : "Vehicle capacity constraints"}</strong>
                </span>
              </div>
            </motion.div>
          )}


          <AnimatePresence>
            {state === "on-way" && warehouseIssue && (
              <WarehouseIssueWarning />
            )}
          </AnimatePresence>


          {state === "confirmed" && (
            <div className="order-detail-info">
              <span className="next-steps-icon">
                <Clock3 />
              </span>
              <div>
                <strong>What happens next?</strong>
                <p>
                  Once the dispatcher schedules this order, the expected arrival
                  time will appear here.
                </p>
              </div>
            </div>
          )}

          <section className="ordered-products-panel">
            <div className="order-detail-section-heading">
              <div>
                <span>Ordered products</span>
                <small>The quantities originally requested.</small>
              </div>
              <span>4 products · 80 units</span>
            </div>
            <ReviewProductList items={items} />
          </section>
        </div>

        <aside className="order-record-panel">
          <div className="order-detail-section-heading">
            <div>
              <span>Record history</span>
              <small>Activity for this order.</small>
            </div>
          </div>
          <OrderActivity state={state} />

          <div className="order-record-meta">
            <span>
              <small>Order type</small>
              <strong>{formatOrderType(business || "fresh", getDefaultOrderType(business || "fresh"))}</strong>
            </span>
            <span>
              <small>Target date</small>
              <strong>Thursday, 1 October</strong>
            </span>
            <span>
              <small>Outlet</small>
              <strong>{formatOutlet(business)}</strong>
            </span>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {showAction && (
          <motion.div
            className="order-detail-mobile-action"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={calmSpring}
          >
            <Button size="mobile" onClick={onReviewDelivery}>
              Review delivery
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}




