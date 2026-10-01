// src/components/monitoring/PersonBadge.tsx - Driver and personnel hover card badge

import { Phone, UserRound } from "lucide-react"
import { UnstyledButton } from "@/components/ui"
import { Person } from "@/types"

export interface PersonBadgeProps {
  person: Person
  size?: "small" | "medium" | "large"
  showRole?: boolean
}

export function PersonBadge({
  person,
  size = "medium",
  showRole = false,
}: PersonBadgeProps) {
  return (
    <div className={`person-badge person-badge--${size}`}>
      <UnstyledButton
        aria-label={`View ${person.name}, ${person.role}`}
        className="person-trigger"
      >
        <UserRound aria-hidden="true" size={size === "large" ? 38 : 25} />
      </UnstyledButton>
      {showRole ? <strong>{person.role}</strong> : null}
      <div className="person-card" role="tooltip">
        <span className="person-card__portrait">
          <UserRound aria-hidden="true" size={40} />
        </span>
        <span className="person-card__details">
          <strong>{person.name}</strong>
          <span>
            {person.role} {person.shop ? `· ${person.shop}` : ""}
          </span>
          <UnstyledButton
            className="person-card__phone"
            onClick={() => {
              window.location.href = `tel:${person.phone.replace(/ /g, "")}`
            }}
          >
            <Phone aria-hidden="true" size={14} />
            {person.phone}
          </UnstyledButton>
        </span>
      </div>
    </div>
  )
}
export default PersonBadge;
