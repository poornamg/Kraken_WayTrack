import { useState, useCallback } from "react"
import type { ReceiptFlowState, ReceiptIssueType } from "../types"

export function useReceiptFlow(initialState: ReceiptFlowState = "verify") {
  const [state, setState] = useState<ReceiptFlowState>(initialState)
  const [received, setReceived] = useState<Record<string, number>>({
    rice: 20,
    "milk-powder": 28,
    flour: 10,
    "cooking-oil": 20,
  })
  const [issueTypes, setIssueTypes] = useState<Record<string, ReceiptIssueType>>({
    rice: "good",
    "milk-powder": "missing",
    flour: "good",
    "cooking-oil": "damaged",
  })
  const [damaged, setDamaged] = useState<Record<string, number>>({
    "cooking-oil": 1,
  })
  const [issueSearch, setIssueSearch] = useState("")
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null)
  const [remark, setRemark] = useState("One bottle was damaged during unloading.")
  const [photoAdded, setPhotoAdded] = useState(false)

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIssueId((curr) => (curr === id ? null : id))
  }, [])

  const updateReceived = useCallback((productId: string, quantity: number) => {
    setReceived((prev) => ({ ...prev, [productId]: quantity }))
  }, [])

  const updateIssueType = useCallback((productId: string, issueType: ReceiptIssueType) => {
    setIssueTypes((prev) => ({ ...prev, [productId]: issueType }))
  }, [])

  const updateDamaged = useCallback((productId: string, quantity: number) => {
    setDamaged((prev) => ({ ...prev, [productId]: quantity }))
  }, [])

  return {
    state,
    setState,
    received,
    setReceived,
    issueTypes,
    setIssueTypes,
    damaged,
    setDamaged,
    issueSearch,
    setIssueSearch,
    expandedIssueId,
    toggleExpanded,
    remark,
    setRemark,
    photoAdded,
    setPhotoAdded,
    updateReceived,
    updateIssueType,
    updateDamaged,
  }
}
