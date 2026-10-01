import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "motion/react"
import { calmSpring } from "../../constants/springs"
import { TopBar } from "./TopBar"
import { BottomNavigation } from "./BottomNavigation"
import { useStore } from "../../context/StoreContext"
import { HomePage } from "../../pages/HomePage"
import { OrdersPage } from "../../pages/OrdersPage"
import { DeliveriesPage } from "../../pages/DeliveriesPage"
import { NewOrderPage } from "../../pages/NewOrderPage"
import { ReviewOrderPage } from "../../pages/ReviewOrderPage"
import { OrderConfirmationPage } from "../../pages/OrderConfirmationPage"
import { OrderDetailPage } from "../../pages/OrderDetailPage"
import { ReceiptFlowPage } from "../../pages/ReceiptFlowPage"

export function AppShell() {
  const {
    business,
    handleBusinessChange,
    orderType,
    setOrderType,
    drafts,
    setDrafts,
    view,
    setView,
    currentNav,
    navigate,
    directionRef,
    pageVariants,
    selectedOrderId,
    handleOpenOrder,
    orderDetailState,
    setOrderDetailState,
    receiptFlowState,
    setReceiptFlowState,
    prototypeState,
    showAttention,
    afterCutoff,
    showUpcoming,
  } = useStore()

  const mainContentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    mainContentRef.current?.scrollTo({ top: 0, behavior: "auto" })
  }, [view])

  return (
    <div className="app-shell">
      <div className="app-area">
        <TopBar
          business={business}
          current={currentNav}
          onNavigate={navigate}
          afterCutoff={prototypeState === "after-cutoff" || prototypeState === "full"}
        />
        <main className="main-content" ref={mainContentRef}>
          <AnimatePresence mode="wait" initial={false} custom={directionRef.current}>
            {view === "home" && (
              <motion.div
                key="home"
                custom={directionRef.current}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <HomePage
                  business={business}
                  onBusinessChange={handleBusinessChange}
                  showAttention={showAttention}
                  afterCutoff={afterCutoff}
                  showUpcoming={showUpcoming}
                  onNewOrder={() => setView("new-order")}
                  onOpenDeferred={() => {
                    setOrderDetailState("deferred")
                    setView("order-detail")
                  }}
                  onOpenOrder={handleOpenOrder}
                  onNavigate={navigate}
                />
              </motion.div>
            )}

            {view === "orders" && (
              <motion.div
                key="orders"
                custom={directionRef.current}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <OrdersPage
                  business={business}
                  onNewOrder={() => setView("new-order")}
                  onOpenOrder={handleOpenOrder}
                />
              </motion.div>
            )}

            {view === "deliveries" && (
              <motion.div
                key="deliveries"
                custom={directionRef.current}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <DeliveriesPage
                  business={business}
                  onOpenOrder={handleOpenOrder}
                />
              </motion.div>
            )}

            {view === "new-order" && (
              <motion.div
                key="new-order"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <NewOrderPage
                  business={business}
                  afterCutoff={afterCutoff}
                  type={orderType}
                  onTypeChange={setOrderType}
                  quantities={drafts}
                  onQuantitiesChange={setDrafts}
                  initialSearch={prototypeState === "search" ? "Rice" : ""}
                  initialSummaryOpen={prototypeState === "summary"}
                  onReview={() => setView("review")}
                />
              </motion.div>
            )}

            {view === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <ReviewOrderPage
                  business={business}
                  type={orderType}
                  quantities={drafts}
                  afterCutoff={afterCutoff}
                  forceError={prototypeState === "submit-error"}
                  onBack={() => setView("new-order")}
                  onConfirmed={() => setView("confirmation")}
                />
              </motion.div>
            )}

            {view === "confirmation" && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={calmSpring}
              >
                <OrderConfirmationPage
                  business={business}
                  type={orderType}
                  quantities={drafts}
                  afterCutoff={afterCutoff}
                  onHome={() => setView("home")}
                  onViewOrder={() => {
                    setOrderDetailState("confirmed")
                    setView("order-detail")
                  }}
                />
              </motion.div>
            )}

            {view === "order-detail" && (
              <motion.div
                key="order-detail"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <OrderDetailPage
                  orderId={selectedOrderId}
                  business={business}
                  onBusinessChange={handleBusinessChange}
                  state={orderDetailState}
                  onBack={() => setView("home")}
                  onStateChange={setOrderDetailState}
                  onOpenOrder={handleOpenOrder}
                  onNavigateDeferred={() => {
                    setOrderDetailState("deferred")
                    setView("order-detail")
                  }}
                  onReviewDelivery={() => {
                    setReceiptFlowState("verify")
                    setView("verify-delivery")
                  }}
                />
              </motion.div>
            )}

            {view === "verify-delivery" && (
              <motion.div
                key="verify-delivery"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <ReceiptFlowPage
                  orderId={selectedOrderId}
                  business={business}
                  onBusinessChange={handleBusinessChange}
                  state={receiptFlowState}
                  onStateChange={setReceiptFlowState}
                  onBack={() => {
                    setOrderDetailState("awaiting-confirmation")
                    setView("order-detail")
                  }}
                  onHome={() => setView("home")}
                  onOpenOrder={handleOpenOrder}
                  onViewOrder={(withIssue) => {
                    setOrderDetailState(
                      withIssue ? "receipt-issue" : "receipt-confirmed"
                    )
                    setView("order-detail")
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <BottomNavigation current={currentNav} onNavigate={navigate} />
    </div>
  )
}
