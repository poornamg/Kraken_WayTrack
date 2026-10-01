import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { Check, ChevronDown } from "lucide-react"
import { SearchField } from ".//SearchField"
import { TextField } from ".//TextField"
import { formatOutlet } from "../../utils/index"

export function FormExamples() {
  return (
    <div className="form-grid">
      <SearchField />
      <TextField label="Delivery reference" placeholder="Enter reference" />
      <label className="field">
        <span className="field-label">Order type</span>
        <span className="select-wrap">
          <select defaultValue="dry">
            <option value="dry">Dry groceries</option>
            <option value="chilled">Chilled / Frozen</option>
          </select>
          <ChevronDown />
        </span>
      </label>
      <TextField
        label="Purchase reference"
        placeholder="Required"
        state="error"
      />
      <TextField
        label="Outlet"
        placeholder={formatOutlet()}
        state="disabled"
      />
      <label className="field field--wide">
        <span className="field-label">Delivery note</span>
        <textarea placeholder="Add an optional note for this order" />
      </label>
      <label className="checkbox-field">
        <input type="checkbox" defaultChecked />
        <span className="checkbox-control">
          <Check />
        </span>
        <span>Send me a delivery status update</span>
      </label>
    </div>
  )
}


