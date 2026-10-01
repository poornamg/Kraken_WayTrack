import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { Plus } from "lucide-react"
import { Button } from ".//Button"
import { navigation } from "../layout/navigation"
import { OutletIdentity } from "../layout/OutletIdentity"
import { DeliveryCard } from ".//DeliveryCard"
import { CutoffBanner } from "../home/CutoffBanner"

export function MobileShellPreview() {
  return (
    <div className="phone-frame">
      <div className="phone-status">
        <span>9:41</span>
        <span>● ● ●</span>
      </div>
      <div className="phone-header">
        <OutletIdentity business="fresh" />
        <span className="avatar">DF</span>
      </div>
      <div className="phone-content">
        <span className="eyebrow">Mobile shell</span>
        <div className="phone-title">Clear actions at the counter</div>
        <p>
          Important outlet information stays readable and focused on one task at
          a time.
        </p>
        <CutoffBanner />
        <DeliveryCard business="fresh" />
      </div>
      <div className="phone-sticky-action">
        <Button size="mobile" icon={<Plus />}>
          New order
        </Button>
      </div>
      <div className="phone-bottom-nav">
        {navigation.map(({ label, icon: Icon }, index) => (
          <span className={index === 0 ? "selected" : ""} key={label}>
            <Icon />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}


