import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { Check, PackageOpen } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { getDefaultOrderType, pluralizeUnit, selectedProducts } from "../../utils/index"
import { mockDrafts } from "../../types/index"
import { getDraft } from "../../data/mockData"

export function ReceiptGoodRows({ business = "fresh" }: { business?: "fresh" | "style" | "tech" }) {
  const receiptProducts = selectedProducts(business, getDefaultOrderType(business || "fresh"), getDraft(mockDrafts[business], getDefaultOrderType(business || "fresh")))
  return (
    <div className="receipt-good-list">
      {receiptProducts.map((product) => (
        <motion.div
          className="receipt-good-row"
          key={product.id}
          layout
          transition={calmSpring}
        >
          <span className="catalog-product-icon">
            <PackageOpen />
          </span>
          <div>
            <strong>{product.name}</strong>
            <small>
              {product.quantity} / {product.quantity}{" "}
              {pluralizeUnit(product.unit, product.quantity)}
            </small>
          </div>
          <span className="verification-status verification-status--good">
            <Check />
            Good
          </span>
        </motion.div>
      ))}
    </div>
  )
}


