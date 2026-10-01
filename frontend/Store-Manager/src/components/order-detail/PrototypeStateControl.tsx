import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react"

export function PrototypeStateControl<T extends string>({
  value,
  options,
  onChange,
  onSimulatePin,
}: {
  value: T
  options: Array<{
    value: T
    label: string
  }>
  onChange: (value: T) => void
  onSimulatePin?: () => void
}) {
  const stateIndex = options.findIndex((option) => option.value === value)
  return (
    <div className="prototype-state-control">
      <span className="prototype-only-label">Prototype only</span>
      <label>
        <span>Prototype state</span>
        <span className="prototype-select-wrap">
          <select
            value={value}
            onChange={(event) => onChange(event.target.value as T)}
          >
            {options.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown />
        </span>
      </label>
      <div className="prototype-step-actions">
        <button
          type="button"
          disabled={stateIndex === 0}
          onClick={() => onChange(options[Math.max(0, stateIndex - 1)].value)}
        >
          <ArrowLeft />
          Previous
        </button>
        {onSimulatePin && value === "arrived" && (
          <button type="button" onClick={onSimulatePin} style={{ color: "var(--emerald-700)", borderColor: "var(--emerald-600)", background: "var(--emerald-50)" }}>
            <CheckCircle2 style={{ width: 14, height: 14 }} />
            Simulate PIN verified
          </button>
        )}
        <button
          type="button"
          disabled={stateIndex === options.length - 1}
          onClick={() =>
            onChange(
              options[Math.min(options.length - 1, stateIndex + 1)].value,
            )
          }
        >
          Next
          <ArrowRight />
        </button>
      </div>
    </div>
  )
}


