import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { CheckCircle2, CircleAlert, Home, Menu, PackageCheck, Plus, ReceiptText, ShoppingBag, Truck } from "lucide-react"
import { Button } from "../components/ui/Button"
import { StatusPill } from "../components/ui/StatusPill"
import { BrandMark } from "../components/ui/BrandMark"
import { navigation } from "../components/layout/navigation"
import { OutletIdentity } from "../components/layout/OutletIdentity"
import { Section } from "../components/ui/Section"
import { ExampleCard } from "../components/ui/ExampleCard"
import { DeliveryCard } from "../components/ui/DeliveryCard"
import { CutoffBanner } from "../components/home/CutoffBanner"
import { AttentionCard } from "../components/home/AttentionCard"
import { EtaBlock } from "../components/ui/EtaBlock"
import { ProductRow } from "../components/ui/ProductRow"
import { VerificationRow } from "../components/ui/VerificationRow"
import { Lifecycle } from "../components/ui/Lifecycle"
import { FormExamples } from "../components/ui/FormExamples"
import { Dialog } from "../components/ui/Dialog"
import { BottomSheet } from "../components/ui/BottomSheet"
import { MobileShellPreview } from "../components/ui/MobileShellPreview"
import type { StatusKind } from "../types/index"
import { statusDetails } from "../types/index"
import { formatOutlet } from "../utils/index"

export function FoundationsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [attentionHighlighted, setAttentionHighlighted] = useState(false)

  return (
    <div className="">
      <div className="page-header">
        <div>
          <span className="page-kicker">Store Manager · Phase 1</span>
          <div className="page-title">Interface foundations</div>
          <p>
            Shared shell, responsive patterns and operational components for
            {formatOutlet()}.
          </p>
        </div>
        <div className="page-actions">
          <span className="foundation-badge">
            <CheckCircle2 />
            Daylight system
          </span>
          <Button icon={<Plus />}>New order</Button>
        </div>
      </div>

      <div className="principle-strip">
        <span>
          <CheckCircle2 />
          Outlet-specific
        </span>
        <span>
          <PackageCheck />
          Review before commitment
        </span>
        <span>
          <CircleAlert />
          Important states stay visible
        </span>
      </div>

      <Section
        eyebrow="01 · Foundations"
        title="Shell and responsive structure"
        description="A restrained desktop workspace paired with a thumb-friendly mobile layout."
      >
        <div className="shell-showcase">
          <div className="shell-note">
            <div className="mini-shell">
              <div className="mini-sidebar">
                <BrandMark compact />
                <span className="mini-nav-selected">
                  <Home /> Home
                </span>
                <span>
                  <ShoppingBag /> Orders
                </span>
                <span>
                  <Truck /> Deliveries
                </span>
              </div>
              <div className="mini-workspace">
                <div className="mini-topbar">
                  <OutletIdentity business="fresh" />
                  <span className="avatar">DF</span>
                </div>
                <div className="mini-content">
                  <span className="skeleton skeleton--title" />
                  <span className="skeleton skeleton--text" />
                  <div className="mini-card-row">
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
            <div className="shell-caption">
              <span className="eyebrow">Desktop · 1280–1440</span>
              <strong>Compact navigation, fixed outlet context</strong>
              <p>
                Store managers see only Home, Orders and Deliveries. The
                account’s outlet is visible, but is not a global selector.
              </p>
            </div>
          </div>
          <div className="mobile-preview-wrap">
            <MobileShellPreview />
            <div className="shell-caption">
              <span className="eyebrow">Mobile · 390</span>
              <strong>One-column, action-first layout</strong>
              <p>
                Persistent bottom navigation and an optional 56px sticky action.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="02 · Actions"
        title="Buttons and interaction states"
        description="Primary actions are cobalt; issue actions are reserved for genuine exceptions."
      >
        <div className="nav-state-preview">
          <span className="nav-state-label">
            Navigation · idle / hover / selected
          </span>
          <div className="nav-state-items">
            <span className="nav-state-item">
              <ShoppingBag />
              Orders
              <small>Idle</small>
            </span>
            <span className="nav-state-item nav-state-item--hover">
              <Truck />
              Deliveries
              <small>Hover</small>
            </span>
            <span className="nav-state-item nav-state-item--selected">
              <Home />
              Home
              <small>Selected</small>
            </span>
          </div>
        </div>
        <div className="example-grid example-grid--three">
          <ExampleCard
            title="Primary"
            caption="Default · hover · pressed · disabled"
          >
            <div className="component-row">
              <Button>Continue</Button>
              <Button className="button-demo-hover">Continue</Button>
              <Button className="button-demo-pressed">Continue</Button>
              <Button disabled>Continue</Button>
            </div>
          </ExampleCard>
          <ExampleCard title="Secondary">
            <div className="component-row">
              <Button tone="secondary">Back to edit</Button>
              <Button tone="secondary" className="button-demo-hover">
                Back to edit
              </Button>
              <Button tone="secondary" disabled>
                Back to edit
              </Button>
            </div>
          </ExampleCard>
          <ExampleCard title="Issue action">
            <div className="component-row">
              <Button tone="issue">Report an issue</Button>
              <Button tone="issue" className="button-demo-hover">
                Report an issue
              </Button>
            </div>
          </ExampleCard>
        </div>
      </Section>

      <Section
        eyebrow="03 · Shared status"
        title="Statuses, notices and expected arrival"
        description="Every state combines a label, icon and semantic colour."
      >
        <div className="example-grid">
          <ExampleCard
            title="Status pills"
            caption="Consistent across WayLink"
            wide
          >
            <div className="pill-collection">
              {(Object.keys(statusDetails) as StatusKind[]).map((kind) => (
                <StatusPill kind={kind} key={kind} />
              ))}
            </div>
          </ExampleCard>
          <ExampleCard
            title="Expected arrival"
            caption="High-priority information"
          >
            <EtaBlock />
          </ExampleCard>
          <ExampleCard title="Before cutoff">
            <CutoffBanner />
          </ExampleCard>
          <ExampleCard
            title="After cutoff"
            caption="Informational, not critical"
          >
            <CutoffBanner closed />
          </ExampleCard>
          <ExampleCard title="Attention card" caption="Idle · highlighted" wide>
            <div className="state-preview-toolbar">
              <span>
                {attentionHighlighted
                  ? "Highlighted state draws focus without becoming critical."
                  : "Idle state remains visible and calm."}
              </span>
              <Button
                tone="secondary"
                onClick={() => setAttentionHighlighted((value) => !value)}
              >
                {attentionHighlighted ? "Show idle" : "Highlight card"}
              </Button>
            </div>
            <AttentionCard highlighted={attentionHighlighted} />
          </ExampleCard>
        </div>
      </Section>

      <Section
        eyebrow="04 · Operational records"
        title="Cards, rows and lifecycle"
        description="Reusable record patterns keep order and delivery information consistent."
      >
        <div className="example-grid">
          <ExampleCard title="Order / delivery card">
            <DeliveryCard business="fresh" />
          </ExampleCard>
          <ExampleCard title="Product row" caption="Quantity is interactive">
            <ProductRow />
          </ExampleCard>
          <ExampleCard title="Delivery verification" wide>
            <div className="verification-list">
              <VerificationRow state="good" received={30} />
              <VerificationRow state="missing" received={28} />
              <VerificationRow state="damaged" received={29} />
            </div>
          </ExampleCard>
          <ExampleCard
            title="Lifecycle · current step progression"
            caption="Interactive prototype state"
            wide
          >
            <Lifecycle interactive />
          </ExampleCard>
          <ExampleCard title="Lifecycle · deferred exception" wide>
            <Lifecycle deferred />
          </ExampleCard>
        </div>
      </Section>

      <Section
        eyebrow="05 · Forms"
        title="Inputs and data entry"
        description="Visible focus, clear errors and readable disabled states support counter workflows."
      >
        <ExampleCard title="Form controls" wide>
          <FormExamples />
        </ExampleCard>
      </Section>

      <Section
        eyebrow="06 · Overlays"
        title="Review and selection patterns"
        description="Desktop uses focused dialogs; mobile uses thumb-friendly bottom sheets."
      >
        <div className="overlay-launchers">
          <div>
            <span className="overlay-icon">
              <ReceiptText />
            </span>
            <div>
              <strong>Desktop review dialog</strong>
              <p>Use for review-before-commitment confirmations.</p>
              <span className="motion-state-tag">
                Closed · opens with scale + fade
              </span>
            </div>
            <Button tone="secondary" onClick={() => setDialogOpen(true)}>
              Preview dialog
            </Button>
          </div>
          <div>
            <span className="overlay-icon">
              <Menu />
            </span>
            <div>
              <strong>Mobile bottom sheet</strong>
              <p>Use for compact reason, selection and review tasks.</p>
              <span className="motion-state-tag">
                Closed · opens with spring rise
              </span>
            </div>
            <Button tone="secondary" onClick={() => setSheetOpen(true)}>
              Preview sheet
            </Button>
          </div>
        </div>
      </Section>

      <AnimatePresence>
        {dialogOpen && <Dialog onClose={() => setDialogOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {sheetOpen && <BottomSheet onClose={() => setSheetOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}


