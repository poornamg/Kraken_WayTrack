import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { Minus, Plus } from "lucide-react"
import { IconButton } from ".//Button"

export function QuantityControl({
  value,
  onChange,
  disabled = false,
}: {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}) {
  return (
    <div
      className={`quantity-control ${
        disabled ? "quantity-control--disabled" : ""
      }`}
    >
      <IconButton
        label="Decrease quantity"
        onClick={() => !disabled && onChange(Math.max(0, value - 1))}
      >
        <Minus />
      </IconButton>
      <span className="quantity-value">{value}</span>
      <IconButton
        label="Increase quantity"
        onClick={() => !disabled && onChange(value + 1)}
      >
        <Plus />
      </IconButton>
    </div>
  )
}


