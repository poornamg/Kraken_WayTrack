import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { Search } from "lucide-react"

export function SearchField() {
  return (
    <label className="field">
      <span className="field-label">Search</span>
      <span className="input-wrap input-wrap--icon">
        <Search />
        <input placeholder="Search orders" />
      </span>
    </label>
  )
}


