export function ReceiptSummary({
  totalProducts = 4,
  totalUnits = 80,
  missingUnits = 0,
  damagedUnits = 0,
}: {
  totalProducts?: number
  totalUnits?: number
  missingUnits?: number
  damagedUnits?: number
}) {
  return (
    <div className="receipt-summary-block" style={{ padding: "12px 16px", background: "var(--slate-50)", borderRadius: "6px", display: "flex", gap: "16px", fontSize: "13px" }}>
      <span>
        <strong>{totalProducts}</strong> products
      </span>
      <span>
        <strong>{totalUnits}</strong> ordered units
      </span>
      {missingUnits > 0 && (
        <span style={{ color: "var(--red-600)" }}>
          <strong>{missingUnits}</strong> missing
        </span>
      )}
      {damagedUnits > 0 && (
        <span style={{ color: "var(--amber-600)" }}>
          <strong>{damagedUnits}</strong> damaged
        </span>
      )}
    </div>
  )
}
