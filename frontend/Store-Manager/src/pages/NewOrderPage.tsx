import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { ArrowRight, ChevronUp, Search } from "lucide-react"
import { getCatalogue } from "../services/store"
import { calmSpring } from "../constants/springs"
import { Button } from "../components/ui/Button"
import { OrderTypeSelector } from "../components/new-order/OrderTypeSelector"
import { ProductSelectionRow } from "../components/new-order/ProductSelectionRow"
import { OrderPlanningContext } from "../components/new-order/OrderPlanningContext"
import { DesktopOrderSummary } from "../components/new-order/DesktopOrderSummary"
import { MobileOrderSummarySheet } from "../components/new-order/MobileOrderSummarySheet"
import type { OrderType, OrderDrafts, CatalogProduct } from "../types/index"
import { productCatalog } from "../types/index"
import { formatOrderType, getDefaultOrderType, selectedProducts } from "../utils/index"
import { getDraft, getCatalog } from "../data/mockData"

export function NewOrderPage({ business, 
  afterCutoff = false,
  type,
  onTypeChange,
  quantities,
  onQuantitiesChange,
  initialSearch = "",
  initialSummaryOpen = false,
  onReview,
}: { business: "fresh" | "style" | "tech", afterCutoff?: boolean
  type: OrderType
  onTypeChange: (type: OrderType) => void
  quantities: OrderDrafts
  onQuantitiesChange: (drafts: OrderDrafts) => void
  initialSearch?: string
  initialSummaryOpen?: boolean
  onReview: () => void
}) {
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [summaryOpen, setSummaryOpen] = useState(initialSummaryOpen)
  const [, setCatalogueVersion] = useState(0)

  useEffect(() => {
    let active = true
    void getCatalogue(business, type)
      .then((rows) => {
        if (!active) return
        productCatalog[business][type] = rows.map((row) => ({ id: row._id, name: row.name, unit: row.unit }))
        setCatalogueVersion((version) => version + 1)
      })
      .catch((error) => {
        if (import.meta.env.VITE_ALLOW_UNAUTHENTICATED_PROTOTYPE !== "true") {
          productCatalog[business][type] = []
          setCatalogueVersion((version) => version + 1)
        }
        console.error("Catalogue request failed", error)
      })
    return () => { active = false }
  }, [business, type])

  const products = getCatalog(business, type)
  const filteredProducts = products.filter((product: CatalogProduct) =>
    product.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  )
  const currentItems = selectedProducts(business, type, getDraft(quantities, type))
  const totalUnits = currentItems.reduce(
    (total, product) => total + product.quantity,
    0,
  )

  function updateQuantity(productId: string, quantity: number) {
    onQuantitiesChange({
      ...quantities,
      [type]: {
        ...getDraft(quantities, type),
        [productId]: Math.max(0, quantity),
      },
    })
  }

  function changeOrderType(nextType: OrderType) {
    onTypeChange(nextType)
    setSearchQuery("")
  }

  function clearCurrentOrder() {
    onQuantitiesChange({ ...quantities, [type]: {} })
  }

  return (
    <div className="new-order-page">
      <div className="new-order-header">
        <div>
          <span className="page-kicker">Store order</span>
          <div className="page-title">New order</div>
          <p>
            Select the products your store needs and enter the required
            quantities.
          </p>
        </div>
        <OrderPlanningContext afterCutoff={afterCutoff} />
      </div>

      <div className="new-order-layout">
        <motion.section
          className="product-workspace"
          layout
          transition={calmSpring}
        >
          {business === "fresh" ? (<OrderTypeSelector
            type={type}
            quantities={quantities}
            onChange={changeOrderType}
          />) : (<div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{business === "style" ? "Style stock" : "Tech stock"}</div>)}

          <label className="field product-search">
            <span className="field-label">Find a product</span>
            <span className="input-wrap input-wrap--icon">
              <Search />
              <input
                value={searchQuery}
                placeholder="Search products..."
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </span>
          </label>

          <div className="product-list-heading">
            <span>
              {formatOrderType(business || "fresh", getDefaultOrderType(business || "fresh"))}
            </span>
            <small>{filteredProducts.length} products</small>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              className="catalog-product-list"
              key={`${type}-${searchQuery}`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product: CatalogProduct) => (
                  <ProductSelectionRow
                    product={product}
                    quantity={getDraft(quantities, type)[product.id] ?? 0}
                    onChange={(quantity) =>
                      updateQuantity(product.id, quantity)
                    }
                    key={product.id}
                  />
                ))
              ) : (
                <div className="product-search-empty">
                  <Search />
                  <strong>No matching products</strong>
                  <p>Try another product name.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.section>

        <DesktopOrderSummary business={business}
          type={type}
          items={currentItems}
          totalUnits={totalUnits}
          onClear={clearCurrentOrder}
          afterCutoff={afterCutoff}
          onReview={onReview}
        />
      </div>

      <motion.div
        className="mobile-order-action"
        layout
        transition={calmSpring}
      >
        <button
          className="mobile-summary-trigger"
          type="button"
          disabled={currentItems.length === 0}
          onClick={() => setSummaryOpen(true)}
        >
          <span>
            <strong>{currentItems.length} products</strong>
            <small>{totalUnits} total units</small>
          </span>
          <ChevronUp />
        </button>
        <Button
          size="mobile"
          disabled={currentItems.length === 0}
          onClick={onReview}
        >
          Review order
          <ArrowRight />
        </Button>
      </motion.div>

      <AnimatePresence initial={false}>
        {summaryOpen && (
          <MobileOrderSummarySheet business={business}
            type={type}
            items={currentItems}
            totalUnits={totalUnits}
            onClose={() => setSummaryOpen(false)}
            onReview={onReview}
          />
        )}
      </AnimatePresence>
    </div>
  )
}


