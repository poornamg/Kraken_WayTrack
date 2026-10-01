import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { Plus } from "lucide-react"
import { Button } from "../ui/Button"

export function FloatingNewOrder({ onClick }: { onClick: () => void }) {
  return (
    <div className="floating-new-order">
      <Button icon={<Plus />} onClick={onClick} tone="primary">
        New order
      </Button>
    </div>
  )
}


