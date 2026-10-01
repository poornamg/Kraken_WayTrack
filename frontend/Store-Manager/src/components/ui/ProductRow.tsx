import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { PackageOpen } from "lucide-react"
import { QuantityControl } from ".//QuantityControl"

export function ProductRow() {
  const [quantity, setQuantity] = useState(20)
  return (
    <div className="product-row">
      <span className="product-icon">
        <PackageOpen />
      </span>
      <div className="product-copy">
        <strong>Rice</strong>
        <small>Unit: bag</small>
      </div>
      <QuantityControl value={quantity} onChange={setQuantity} />
    </div>
  )
}


