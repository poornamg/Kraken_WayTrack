import { AnimatePresence, motion } from "motion/react"
import { ArrowRight, PackageOpen, Search } from "lucide-react"
import { calmSpring } from "../../constants/springs"
import { Button } from "../ui/Button"
import { ReceiptIssueRow } from "./ReceiptIssueRow"
import type { ReceiptFlowState, ReceiptIssueType, CatalogProduct } from "../../types"

export function ReceiptIssueEditView({
  business,
  receiptProducts,
  received,
  issueTypes,
  damaged,
  issueSearch,
  setIssueSearch,
  expandedIssueId,
  setExpandedIssueId,
  remark,
  setRemark,
  photoAdded,
  setPhotoAdded,
  onReceivedChange,
  onIssueChange,
  onDamagedChange,
  onStateChange,
}: {
  business: "fresh" | "style" | "tech"
  receiptProducts: Array<CatalogProduct & { quantity: number }>
  received: Record<string, number>
  issueTypes: Record<string, ReceiptIssueType>
  damaged: Record<string, number>
  issueSearch: string
  setIssueSearch: (s: string) => void
  expandedIssueId: string | null
  setExpandedIssueId: React.Dispatch<React.SetStateAction<string | null>>
  remark: string
  setRemark: (r: string) => void
  photoAdded: boolean
  setPhotoAdded: React.Dispatch<React.SetStateAction<boolean>>
  onReceivedChange: (id: string, qty: number) => void
  onIssueChange: (id: string, issue: ReceiptIssueType) => void
  onDamagedChange: (id: string, qty: number) => void
  onStateChange: (state: ReceiptFlowState) => void
}) {
  return (
    <motion.div
      className="receipt-issue-editor"
      key="issue-edit"
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={calmSpring}
    >
      <div style={{ padding: "16px 24px 0", borderBottom: "1px solid var(--border)" }}>
        <label className="field">
          <span className="input-wrap input-wrap--icon">
            <Search />
            <input
              placeholder="Search products"
              value={issueSearch}
              onChange={(e) => setIssueSearch(e.target.value)}
            />
          </span>
        </label>
      </div>
      <div className="receipt-issue-list">
        {receiptProducts
          .filter((p) => p.name.toLowerCase().includes(issueSearch.toLowerCase()))
          .map((product) => (
            <ReceiptIssueRow
              key={product.id}
              business={business}
              product={product}
              received={received[product.id] ?? product.quantity}
              issueType={issueTypes[product.id] ?? "good"}
              damaged={damaged[product.id] ?? 0}
              isExpanded={expandedIssueId === product.id}
              onToggle={() =>
                setExpandedIssueId((current) => (current === product.id ? null : product.id))
              }
              onReceivedChange={(quantity) => onReceivedChange(product.id, quantity)}
              onIssueChange={(value) => onIssueChange(product.id, value)}
              onDamagedChange={(quantity) => onDamagedChange(product.id, quantity)}
            />
          ))}
      </div>

      <div className="receipt-evidence-card">
        <label className="field">
          <span className="field-label">Add remark · Optional</span>
          <textarea
            value={remark}
            placeholder="Describe anything the structured fields do not cover"
            onChange={(event) => setRemark(event.target.value)}
          />
        </label>
        <div className="photo-field">
          <span className="field-label">Photo · Optional</span>
          <Button
            tone="secondary"
            onClick={() => setPhotoAdded((current) => !current)}
          >
            {photoAdded ? "Remove photo" : "Add photo"}
          </Button>
          <AnimatePresence>
            {photoAdded && (
              <motion.div
                className="photo-preview"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <PackageOpen />
                <span>
                  <strong>delivery-issue.jpg</strong>
                  <small>Photo attached</small>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="receipt-editor-actions">
          <Button onClick={() => onStateChange("issue-review")}>
            Review issues
            <ArrowRight />
          </Button>
          <Button tone="secondary" onClick={() => onStateChange("verify")}>
            Back
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
