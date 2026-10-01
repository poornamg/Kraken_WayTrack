export function PinCard({ pin = "4827" }: { pin?: string }) {
  const digits = (pin || "4827").split("")

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {digits.map((num, i) => (
        <div
          key={i}
          style={{
            width: 48,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 700,
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--navy-900)",
            background: "var(--navy-50)",
          }}
        >
          {num}
        </div>
      ))}
    </div>
  )
}
