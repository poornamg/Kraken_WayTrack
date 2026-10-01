import { motion } from "motion/react"
import { AlertTriangle } from "lucide-react"
import { calmSpring } from "../../constants/springs"

export function WarehouseIssueWarning({
  message = "2 cartons of Milk powder were unavailable during loading.",
  reportedAt = "Reported during loading · 05:32",
}: {
  message?: string
  reportedAt?: string
}) {
  return (
    <motion.div
      className="warehouse-issue-card"
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={calmSpring}
      style={{ overflow: "hidden" }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "16px",
          background: "var(--sunburst-50)",
          border: "1px solid var(--sunburst-200)",
          borderRadius: "8px",
        }}
      >
        <AlertTriangle
          style={{
            color: "var(--sunburst-600)",
            width: 20,
            height: 20,
            flexShrink: 0,
          }}
        />
        <div>
          <strong
            style={{
              display: "block",
              color: "var(--sunburst-900)",
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            Order out for delivery with an issue
          </strong>
          <p
            style={{
              margin: "0 0 8px 0",
              color: "var(--sunburst-900)",
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            {message}
          </p>
          <span style={{ color: "var(--sunburst-700)", fontSize: 12 }}>
            {reportedAt}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
