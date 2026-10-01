import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { PackageOpen } from "lucide-react"
import type { CatalogProduct } from "../../types/index"
import { pluralizeUnit } from "../../utils/index"

export function ReviewProductList({
  items,
}: {
  items: Array<CatalogProduct & { quantity: number }>
}) {
  const totalUnits = items.reduce((total, item) => total + item.quantity, 0)
  return (
    <div className="review-products">
      <div className="review-table-heading">
        <span>Product</span>
        <span>Quantity</span>
      </div>
      {items.map((item) => (
        <div className="review-product-row" key={item.id}>
          <span className="catalog-product-icon">
            <PackageOpen />
          </span>
          <div>
            <strong>{item.name}</strong>
            <small>Unit: {item.unit}</small>
          </div>
          <strong className="review-quantity">
            {item.quantity} {pluralizeUnit(item.unit, item.quantity)}
          </strong>
        </div>
      ))}
      <div className="review-totals">
        <span>
          <strong>{items.length}</strong> products
        </span>
        <span>
          <strong>{totalUnits}</strong> total units
        </span>
      </div>
    </div>
  )
}



