import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { ChevronDown, ChevronUp, PackageOpen } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { DirectQuantityControl } from "../new-order/DirectQuantityControl"
import { IssueChips } from ".//IssueChips"
import type { OrderType, CatalogProduct, ReceiptIssueType } from "../../types/index"
import { pluralizeUnit } from "../../utils/index"

export function ReceiptIssueRow({
  product,
  received,
  issueType,
  damaged,
  onReceivedChange,
  onIssueChange,
  onDamagedChange,
  business = "fresh",
  orderType = "dry",
  isExpanded = false,
  onToggle = () => {},
}: {
  isExpanded?: boolean
  onToggle?: () => void
  product: CatalogProduct & { quantity: number }
  received: number
  issueType: ReceiptIssueType
  damaged: number
  onReceivedChange: (quantity: number) => void
  onIssueChange: (value: ReceiptIssueType) => void
  onDamagedChange: (quantity: number) => void
  business?: "fresh" | "style" | "tech"
  orderType?: OrderType
}) {
  const missing = Math.max(0, product.quantity - received)
  let summaryText = "Good"
  let statusClass = "status-good"
  if (issueType === "missing") {
    summaryText = `Missing ${missing}`
    statusClass = "status-missing"
  } else if (issueType === "damaged") {
    summaryText = `Damaged ${damaged}`
    statusClass = "status-damaged"
  } else if (issueType === "other") {
    summaryText = "Other issue"
    statusClass = "status-other"
  } else if (issueType !== "good") {
    summaryText = issueType.charAt(0).toUpperCase() + issueType.slice(1).replace("-", " ")
    statusClass = "status-other"
  }

  return (
    <motion.div
      className={`receipt-issue-row receipt-issue-row--${issueType} ${isExpanded ? "expanded" : ""}`}
      layout
      transition={calmSpring}
    >
      <div 
        className="receipt-issue-header" 
        onClick={onToggle}
      >
        <div className="receipt-issue-product">
          <span className="catalog-product-icon">
            <PackageOpen />
          </span>
          <div className="product-summary">
            <strong>{product.name}</strong>
            {!isExpanded && (
              <small>
                {product.quantity} ordered · {received} received
                <br />
                <strong className={statusClass} style={{ color: "inherit", fontWeight: 500 }}>{summaryText}</strong>
              </small>
            )}
            {isExpanded && (
              <small>
                Ordered: {product.quantity} {pluralizeUnit(product.unit, product.quantity)}
              </small>
            )}
          </div>
        </div>
        <div className="accordion-icon">
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            className="receipt-issue-expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
            transition={calmSpring}
          >
            <div className="receipt-issue-expanded-content">
              <div className="receipt-quantity-field">
                <span className="field-label">Received</span>
                <DirectQuantityControl
                  quantity={received}
                  max={product.quantity}
                  onChange={onReceivedChange}
                />
              </div>

              <div className="receipt-issue-type">
                <span className="field-label">Issue</span>
                <IssueChips value={issueType} onChange={onIssueChange} business={business} orderType={orderType} />
              </div>

              <AnimatePresence initial={false}>
                {(issueType !== "good") && (
                  <motion.div
                    className="receipt-calculation"
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={calmSpring}
                  >
                    {issueType === "missing" && (
                      <>
                        <span>Calculated missing</span>
                        <strong>
                          {missing} {pluralizeUnit(product.unit, missing)}
                        </strong>
                      </>
                    )}
                    {issueType === "damaged" && (
                      <>
                        <span>Damaged quantity</span>
                        <DirectQuantityControl
                          quantity={damaged}
                          max={received}
                          onChange={onDamagedChange}
                        />
                      </>
                    )}
                    {issueType === "other" && (
                      <>
                        <span>Other issue</span>
                        <strong>Add details in the optional remark below.</strong>
                      </>
                    )}
                    {(issueType !== "missing" && issueType !== "damaged" && issueType !== "other") && (
                      <>
                        <span>{issueType.charAt(0).toUpperCase() + issueType.slice(1).replace("-", " ")}</span>
                        <strong>Add details in the optional remark below.</strong>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}


