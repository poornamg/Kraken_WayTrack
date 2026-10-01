import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { PackageOpen } from "lucide-react"
import { getDefaultOrderType, pluralizeUnit, selectedProducts } from "../../utils/index"
import { mockDrafts } from "../../types/index"
import { getDraft } from "../../data/mockData"

export function ReceiptReadOnlySummary({ business = "fresh" }: { business?: "fresh" | "style" | "tech" }) {
  const receiptProducts = selectedProducts(business, getDefaultOrderType(business || "fresh"), getDraft(mockDrafts[business], getDefaultOrderType(business || "fresh")))
  return (
    <div className="receipt-order-summary">
      <div className="receipt-panel-heading">
        <div>
          <span>Ordered products</span>
          <small>What the driver was expected to deliver.</small>
        </div>
        <span>4 products · 80 units</span>
      </div>
      <div className="receipt-summary-rows">
        {receiptProducts.map((product) => (
          <div className="receipt-summary-row" key={product.id}>
            <span className="catalog-product-icon">
              <PackageOpen />
            </span>
            <strong>{product.name}</strong>
            <span>
              {product.quantity} {pluralizeUnit(product.unit, product.quantity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}


