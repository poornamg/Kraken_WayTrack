import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"

export function TextField({
  label,
  placeholder,
  state,
}: {
  label: string
  placeholder: string
  state?: "error" | "disabled"
}) {
  return (
    <label className={`field ${state ? `field--${state}` : ""}`}>
      <span className="field-label">{label}</span>
      <input disabled={state === "disabled"} placeholder={placeholder} />
      {state === "error" && (
        <small className="field-message">Enter a valid reference.</small>
      )}
    </label>
  )
}


