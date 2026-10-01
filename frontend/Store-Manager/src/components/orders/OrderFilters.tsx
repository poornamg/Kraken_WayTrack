import { Search } from "lucide-react"

export function OrderFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  statuses,
}: {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  statuses: string[]
}) {
  return (
    <div style={{ marginTop: "var(--space-6)" }}>
      <label className="field" style={{ marginBottom: 16 }}>
        <span className="input-wrap input-wrap--icon">
          <Search />
          <input
            placeholder="Search by order ID"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </span>
      </label>

      <div
        className="pill-collection hide-scrollbar"
        style={{ flexWrap: "nowrap", overflowX: "auto", marginBottom: 12 }}
      >
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            style={{
              minHeight: 30,
              padding: "0 var(--space-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-pill)",
              color: statusFilter === s ? "var(--cobalt-600)" : "var(--text-secondary)",
              background: statusFilter === s ? "var(--cobalt-50)" : "var(--white)",
              borderColor: statusFilter === s ? "var(--cobalt-500)" : "var(--border)",
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
            onClick={() => onStatusFilterChange(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
