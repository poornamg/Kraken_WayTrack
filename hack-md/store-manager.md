# Store Manager — Designathon UX & Product Audit

**Project:** WayLink — Waypoint Group  
**Competition:** Tech-Triathlon 2026 Designathon  
**Role audited:** Store Manager  
**System type:** High-fidelity clickable prototype, not production code  
**Primary environments:** Outlet counter on desktop and phone  
**Audit posture:** Read-only product/UX review

---

## Audit basis and confidence

This document consolidates and reconciles:

- the Store Manager implementation audit supplied from the project,
- the WayLink Designathon requirements,
- the WayLink design-system rules,
- the Store Manager review findings,
- and the latest known prototype behavior discussed during the design refinement.

Where the available source supports a finding directly, it is treated as confirmed. Where the prototype uses hard-coded mock data rather than shared datasets, the document calls that out explicitly rather than assuming hidden functionality.

The Store Manager problem is fundamentally about replacing an unreliable information chain:

**Order → Confirmed → Scheduled / Deferred → Delivery progress → Arrival → Goods check → Receipt confirmation / issue report**

The prototype is already strong on the happy path. Its largest remaining scoring opportunities are not visual polish; they are:

1. correct Store Manager ↔ Driver PIN handoff,
2. inline deferred lifecycle + recourse,
3. Driver/Loader record visibility at receipt,
4. offline/degraded Store Manager states,
5. Sri Lanka cutoff / operating-day accuracy,
6. stronger use of outlet constraints and shared-record fields.

---

# 1. Page and state inventory

| Page / Component | File / Component | States / Variants | Navigation / Context | Data / Mock Source |
|---|---|---|---|---|
| Application shell | `src/App.tsx` — `App` | Home, Orders, Deliveries, New Order, Review, Confirmation, Order Detail, Verify Delivery | Root app state; responsive desktop/mobile shell | Root React state + static mocks |
| Top navigation | `TopBar`, outlet identity components | Desktop blue header; mobile blue header; Fresh / Style / Tech outlet identity | Shared across main views | Root business state |
| Mobile navigation | `BottomNavigation` | Home / Orders / Deliveries; selected; liquid/stretch; magnetic drag | Mobile-only main navigation | Root view state |
| Home | `HomePage` | Default, attention/no-attention, next-delivery, upcoming/no-upcoming, prototype outlet switch | Main tab | Static order/delivery mocks |
| Next delivery | `NextDeliveryHero` | Scheduled / ETA | Home | Static example order |
| Upcoming delivery row | `UpcomingDeliveryRow` | Confirmed / deferred / scheduled | Home | Static mocks |
| Recent activity | `RecentActivityList` | Receipt confirmed / issue | Home | Static mocks |
| New Order | `NewOrderPage` | Fresh dry, Fresh chilled, Style stock, Tech stock, search, populated, empty, before-cutoff, after-cutoff | From Home | `productCatalog`, `mockDrafts` |
| Product row | `ProductSelectionRow` | Quantity 0 / positive / direct edit | New Order | Product catalogue |
| Order type selector | `OrderTypeSelector` | Dry / Chilled for Fresh; unified stock type for Style/Tech | New Order | Business-aware state |
| Order summary | Desktop/mobile summary components | Empty / populated | New Order | Current order quantities |
| Cutoff context | `GlobalCutoff`, `OrderPlanningContext` | Before cutoff / after cutoff | Top bar + New Order / Review context | Prototype boolean / hard-coded time text |
| Review Order | `ReviewOrderPage` | Default, submitting, submission error | New Order → Review | Local React state |
| Submission error | `SubmissionError` | Error / retry / back-to-edit | Review | Simulated failure |
| Order confirmation | `OrderConfirmationPage`, `ConfirmationCard` | Success / order received | Review → Confirmation | Static reference + current selections |
| Orders | `OrdersPage` | Default, search, filters, multiple statuses | Main tab | Static order list |
| Deliveries | `DeliveriesPage` | Needs attention, in progress, upcoming, recent | Main tab | Static delivery list |
| Order Detail | `OrderDetailPage` | Confirmed, deferred, scheduled, on-way, arrived, awaiting confirmation, receipt confirmed, receipt issue | Orders/Deliveries → detail | Static lifecycle + state |
| Lifecycle | `OrderDetailLifecycle` | Complete / current / future step | Order Detail | Stage array + timestamps |
| Warehouse issue warning | Order Detail state content | On-way + warning | Order Detail | Prototype issue mock |
| Deferred state | Current unified detail target; older separate deferred page still exists in earlier structure | Deferred / rescheduled | Should remain in same order-detail page | Static reason/date/window |
| Verify Delivery | `ReceiptFlowPage` | Verify, full/good, issue edit, issue review, confirmed, confirmed-with-issue | Arrived → receipt | Static received quantities + local state |
| Receipt item row | `ReceiptIssueRow` | Good, missing, damaged, other; business-specific variants | Verify Delivery | Local issue state |
| Issue chips | `IssueChips` | Missing, damaged, other, temperature, wrong item/variant, seal/package, condition | Verify Delivery | Business-aware options |
| Dialog / bottom sheet | Shared overlay components | Open / closed | Cross-page | Component props |
| Shared controls | Button, status pill, search, fields, ETA block | Default / disabled / active / selected | Cross-page | Props |
| Offline state | **Not found as a Store Manager flow** | — | — | — |
| Queued/sync state | **Not found as a Store Manager flow** | — | — | — |
| Post-confirmation dispute state | **Not found** | — | — | — |

### Inventory conclusion

The prototype is broad enough for the competition. It already covers the core Store Manager happy path and multiple exception states. The missing states are mostly **operational edge cases**, not missing whole screens.

---

# 2. Traceability table

| ID | Requirement | Status | Evidence | Severity | Smallest fix |
|---|---|---|---|---|---|
| SM-01 | Store Manager works on desktop and phone at outlet counter | Covered | Responsive app shell, desktop top bar, mobile top bar + bottom nav | — | None |
| SM-02 | Capture order in structured form | Covered | `NewOrderPage`, product rows, quantity controls | — | None |
| SM-03 | Fresh supports separate dry and chilled orders | Covered | Business-aware order type selector + catalogue | — | None |
| SM-04 | Style/Tech ordering reflects selected store type | Covered after latest fixes | Root business propagation across pages | — | Freeze behavior |
| SM-05 | Show 4 PM next-day cutoff | Covered visually | `GlobalCutoff`, planning context | Medium | Replace static text with Asia/Colombo helper |
| SM-06 | Enforce next operating delivery day | Gap | No calendar-based Sunday / non-operating logic | High | Add one next-operating-day helper |
| SM-07 | Explicit order received confirmation | Covered | `OrderConfirmationPage` | — | None |
| SM-08 | Explicit later scheduled state | Covered | Order Detail scheduled state | — | None |
| SM-09 | Expected arrival window | Covered | ETA blocks and Order Detail | — | Keep |
| SM-10 | ETA tied to outlet window / plan | Partial | Window shown but mocked | Medium | Show outlet receiving window + planned ETA source |
| SM-11 | Clear deferred notice | Covered | Deferred state with reason/new date | — | Keep |
| SM-12 | Deferred remains in same order-detail sequence | Partial | Latest work moved toward unified page; must remove special-page feeling | High | Treat Deferred as inserted lifecycle event only |
| SM-13 | Deferred reason in plain language | Covered | Reefer/capacity reason copy | — | None |
| SM-14 | New delivery day/window after deferral | Covered | Deferred mock content | — | None |
| SM-15 | Deferral recourse | Gap | “No action required” / no action path | High | Add Request priority + Contact dispatch |
| SM-16 | Consecutive skip indicator | Gap | Not found | Medium | Add “Skipped previous run” chip |
| SM-17 | Confirm receipt line by line | Covered | `ReceiptFlowPage` | — | None |
| SM-18 | Report short quantity | Covered | Receipt item controls | — | None |
| SM-19 | Report damage | Covered | Issue chips | — | None |
| SM-20 | Report wrong item | Covered for Style/Tech variants | Business-aware issue chips | — | Keep |
| SM-21 | Report temperature | Covered for Fresh chilled | Business-aware issue chips | — | Keep |
| SM-22 | Report late arrival | Gap | Not found in issue type | Medium | Add `late` issue reason |
| SM-23 | Optional note | Covered | Receipt issue flow | — | None |
| SM-24 | Optional photo | Partial / implementation-dependent | UI concept exists, actual file capture may not | Medium | Add explicit photo control in prototype if absent |
| SM-25 | Driver record pre-fills receipt | Partial | Some driver completion/arrival info visible; line-level source not explicit | High | Add Driver record summary |
| SM-26 | Store-issued delivery PIN after goods check | **Gap / incorrect sequencing** | PIN exists in current implementation but is shown too early | **High** | Move PIN reveal after goods check |
| SM-27 | PIN tied to specific delivery | Partial | Static PIN; relation not strongly communicated | High | Show order ID + trip/vehicle beside PIN |
| SM-28 | PIN available with poor connectivity | Gap | No offline Store state | High | Add cached/available-offline prototype state |
| SM-29 | Loader shortfall reaches Store | Partial | Warehouse issue concept exists | Medium | Show structured warehouse shortfall on receipt |
| SM-30 | Driver proof visible to Store | Gap | POD photo/signature not visible | High | Add Driver record/POD summary |
| SM-31 | Store offline order/receipt behavior | Gap | Generic submit error only | High | Add offline queued states |
| SM-32 | `van_only`, dock type, mall window visible where relevant | Gap | Not found | Medium | Add compact receiving constraints row |
| SM-33 | Demand calendar affects planning dates | Gap | Not shown/applied | Medium | Apply only to date logic; do not add dashboard clutter |
| SM-34 | Named Store degradation state | Partial | Submission error exists; no strong named Store degradation | Medium | Name and present “Missed the Cutoff” or “Deferred Again” |
| SM-35 | High-fidelity interaction | Covered | Responsive, animated, clickable prototype | — | Freeze |

---

# 3. Order capture and cutoff findings

## What works

The order-entry flow is appropriately structured:

**New Order → Product selection → Quantity → Review → Submit → Confirmation**

This is substantially better than the current-world phone/message workflow because it:

- creates a structured record,
- shows exact products and quantities,
- separates Fresh dry and chilled needs,
- supports business-specific product categories,
- gives the user a final review step,
- and produces a confirmation screen.

The prototype also correctly avoids turning Store Manager into an inventory-management or e-commerce system.

## Cutoff problem

The visible cutoff experience is useful, but the underlying logic is still mostly prototype state.

Current behavior is effectively:

- before cutoff → “2h 14m remaining”
- after cutoff → following planning run

The critical missing pieces are:

- no real **16:00 Asia/Colombo** calculation,
- no Sunday skip,
- no `calendar.csv.is_operating` handling,
- no true next-operating-day calculation,
- no exact “at 4:00 PM” boundary rule.

## Minimum correct logic

For prototype purposes:

```text
if local Sri Lanka time < 16:00:
    target = next operating day
else:
    target = following operating day
```

The helper should:

1. convert/evaluate in `Asia/Colombo`,
2. treat `>= 16:00` as cutoff passed,
3. skip Sunday,
4. optionally skip dates marked non-operating in the demo calendar map.

Do **not** build a full scheduling engine.

---

# 4. Confirmation states findings

The prototype successfully distinguishes two important concepts:

### A. Order received
WayLink has successfully received the store’s order.

### B. Scheduled
The dispatcher has actually allocated the order to a plan/trip.

That distinction directly solves the Store Manager’s current uncertainty.

## Current lifecycle

The intended Store sequence should be:

```text
Order confirmed
    ↓
Scheduled
    ↓
On the way
    ↓
Arrived
    ↓
Receipt confirmation
    ↓
Receipt confirmed / Receipt confirmed with issue
```

Exception branch:

```text
Order confirmed
    ↓
Deferred
    ↓
Scheduled
    ↓
On the way
    ↓
Arrived
    ↓
Receipt confirmation
```

## Loaded state

The audit text recommends adding `Loaded`.

This is useful for cross-role continuity, but it is **not mandatory for the Store Manager’s main mental model**.

If added, use it as a lightweight timeline event, not a new major screen:

```text
Scheduled
Loaded
On the way
```

If time is limited, PIN + deferral + offline work are higher priority.

---

# 5. Expected arrival findings

The prototype clearly shows ETA windows such as:

**06:40–07:00**

That is the right information format because it helps a manager schedule receiving staff.

## What is missing

The ETA is not visibly tied to:

- the outlet receiving window,
- the dispatcher plan,
- a plan-change event,
- or a shared dataset field.

## Minimal improvement

On Scheduled / On the way, display:

```text
Expected arrival
06:40–07:00

Outlet receiving window
05:30–07:30
```

If the plan changes:

```text
Plan changed
Previous ETA 06:40–07:00
New ETA 07:10–07:30
```

This should use warning/sunburst styling.

---

# 6. Deferral handling findings

## Correct product model

Deferred is **not a separate destination page**.

It is an optional lifecycle event between:

**Order confirmed → Scheduled**

Correct:

```text
Order confirmed → Deferred → Scheduled
```

or:

```text
Order confirmed → Scheduled
```

Once Scheduled, both paths merge into the same normal flow.

## What the user should see

The normal Order Detail layout should remain unchanged.

Only add:

### Status
**Deferred**

### Timeline midpoint
```text
Order confirmed
Deferred
Scheduled
On the way
Arrived
Receipt confirmation
```

### Small warning card
```text
Delivery deferred

Reason
Refrigerated delivery capacity unavailable

Original delivery
Thursday, 1 October

New expected delivery
Friday, 2 October · 06:50–07:10
```

If the order was already skipped:

```text
⚠ Skipped previous run
```

## Recourse defect

A deferral with only:

**No action required**

is too passive.

The manager should have at least:

- **Request priority**
- **Contact dispatch**

These can be prototype-only buttons. They do not need real backend behavior.

---

# 7. Receipt and PIN handoff findings

This is the single most important cross-role correction.

## Current problem

The PIN exists, but it is shown at **Arrived** before the Store Manager has completed the goods check.

That breaks the team’s intended handoff.

## Correct sequence

```text
Driver arrives
    ↓
Store Manager confirms physical arrival
    ↓
Store Manager checks goods line by line
    ↓
Good / Missing / Damaged / Other recorded
    ↓
Store Manager finishes goods check
    ↓
System reveals delivery-specific PIN
    ↓
Manager tells PIN to driver
    ↓
Driver enters PIN
    ↓
Proof of delivery is completed
    ↓
Store receipt closes
```

## PIN card

Example:

```text
Delivery PIN

4 8 2 7

For ORD-1082
Trip PLG-03 · Vehicle VEH014

Give this PIN to the driver after checking the goods.

Available offline
```

## Important

The PIN should not be random on every render.

For a prototype, a stable static PIN tied to the delivery is actually better than “random dynamic PIN” because it prevents unexpected changes during the demo.

---

# 8. Issue reporting findings

## Current strengths

The receipt flow supports item-level verification and structured issue types.

Business-specific issues are a good decision:

### Base
- Good
- Missing
- Damaged
- Other

### Fresh chilled
- Temperature issue

### Style
- Wrong item / variant
- Condition issue

### Tech
- Wrong item
- Seal / package issue

## Missing

### Late arrival

Add:

- `Late arrival`

This can be order-level rather than per-product if that fits the current architecture better.

## Driver / loader record context

The Store Manager should not verify “blind”.

Above the receipt list, show a concise system record:

```text
Delivery record

Driver arrived        06:43
Driver completed      06:52
Warehouse shortfall   2 cartons Milk powder unavailable
Driver outcome        Partial delivery
```

Then the manager compares that record against what is physically present.

## After reporting

Show explicit status:

```text
Issue reported
Dispatcher reviewing
```

No need to implement a workflow engine.

---

# 9. Driver record visibility

| Field | Shown? | Desired |
|---|---:|---|
| Planned ETA | Yes | Keep |
| Vehicle | Yes | Keep |
| Trip | Yes | Keep |
| Driver arrival time | Yes / partial | Keep |
| Driver completion time | Yes / partial | Keep |
| Delivered quantity | Partial | Make explicit from Driver record |
| Driver shortfall reason | No | Add |
| Loader shortfall | Partial | Add structured summary |
| POD photo | No | Show small proof indicator / thumbnail |
| Receiver name / signature | No | Optional display |
| Delivery PIN | Yes, but too early | Move after goods check |
| Driver sync/offline state | No | Optional; only show if relevant |
| Plan vs actual arrival delta | No | Nice-to-have |

### Minimum Driver record card

```text
Driver record

Arrived          06:43
Delivery outcome Partial
Driver reported  2 cartons short
Proof            Pending PIN
```

After handoff:

```text
Proof            PIN verified
```

---

# 10. Constraint visibility findings

The Store Manager does not need Dispatcher-level fleet complexity.

However, a few constraints directly affect what the manager needs to know.

## Show when relevant

### Fresh
```text
Receiving window 05:30–07:30
Rear dock
```

### Style mall outlet
```text
Mall access 06:00–09:00
Mall bay
```

### Van-only outlet
```text
Van access only
```

These should appear as compact tags or one metadata row.

## Do not show

Do not surface:

- weekly fuel quota,
- vehicle weight capacity,
- route optimization,
- demand-model details,
- monsoon prediction scores.

Those belong to Dispatcher.

The calendar should influence delivery-date logic silently.

---

# 11. Responsiveness findings

## Width-by-width assessment

| Width | Expected behavior | Risk / note |
|---:|---|---|
| 360 px | Phone layout, compact header, bottom nav | Check quantity controls and receipt issue chips for 48px targets |
| 390 px | Primary tested phone layout | Strongest current mobile target |
| 440 px | Large phone | Verify no overly stretched cards |
| 768 px | Tablet portrait | Current mobile architecture may still be acceptable, but phone-like |
| 1024 px | Tablet / compact desktop | Check breakpoint behavior carefully |
| 1440 px | Desktop counter view | Main polished desktop mode |

## Touch targets

The design system expects **48×48px minimum**.

Priority controls to verify:

- +/- quantity buttons,
- issue chips,
- filter controls,
- search controls,
- prototype state dropdown,
- receipt actions,
- mobile nav items.

Do not enlarge every decorative control if deadline time is limited.

## One-hand use

The mobile bottom navigation and floating New Order pattern are appropriate.

Receipt actions should remain near the bottom of the reachable area when possible.

---

# 12. Connectivity findings

## Current state

The prototype has a general submission-error recovery state, but not a Store Manager offline model.

Missing:

- Offline banner
- Queued order state
- Queued receipt state
- Safe retry messaging
- Duplicate prevention concept
- Cached PIN state

## Minimum prototype behavior

### Order while offline

```text
⚠ Offline

Your order is saved on this device.
It will submit automatically when the connection returns.

Queued · 15:42
```

### Receipt while offline

```text
⚠ Offline

Receipt confirmation saved on this device.
1 update waiting to sync.

Delivery PIN remains available.
```

### On reconnect

```text
✓ Synced
Receipt confirmation uploaded · 07:02
```

No IndexedDB implementation is required for Designathon if the state is clearly demonstrated.

---

# 13. Degradation screen assessment

## Existing degradation quality

The system’s documented Driver degradation — **Dead Zone Drop** — is strong because it is:

- named,
- grounded in the brief,
- visually specific,
- operationally meaningful,
- and explains reconciliation.

The Store Manager side needs equivalent clarity.

## Recommended Store Manager degradation 1 — “Missed the Cutoff”

### Scenario
The manager tries to submit after 4 PM.

### Screen state

```text
Next-day cutoff passed

Tomorrow's planning run is closed.

This order can still be submitted for:
Friday, 2 October

[Submit for Friday]
[Keep editing]
```

### Why it matters
The store should never wonder whether a late order silently entered tomorrow’s plan.

## Recommended Store Manager degradation 2 — “Deferred Again”

### Scenario
The outlet was skipped on the previous run and is deferred again.

### Screen state

```text
⚠ Deferred again

This outlet was also skipped on the previous run.

Reason
Refrigerated capacity unavailable

New expected delivery
Friday, 2 October · 06:50–07:10

[Request priority]
[Contact dispatch]
```

### Why it matters
This directly addresses the brief’s concern about consecutive skips.

## Recommended rating after these fixes

**8.5/10** for Store degradation quality.

---

# 14. Domain accuracy findings

| Current value / behavior | Assessment | Suggested value / rule | Location |
|---|---|---|---|
| `Thursday, 1 October` | Plausible but static | Derive next operating date | Planning context |
| `Friday, 2 October` | Plausible but static | Derive after-cutoff/deferred date | Planning context |
| `2h 14m remaining` | Static | Calculate to 16:00 Asia/Colombo | Global cutoff |
| `4 8 2 7` PIN | Stable demo value is acceptable | Keep stable, but tie to delivery and reveal later | Receipt/PIN |
| `Kandy City` | Acceptable UI label but not dataset-grounded | Pair with actual `OUT###` if dataset row is known | Outlet identity |
| `WP-014` / other non-schema vehicle labels | Likely inconsistent with dataset schema | Use `VEH###` if shared dataset uses that identifier | Delivery detail |
| Fresh dry/chilled separation | Correct | Keep | New Order |
| Style stock | Correct simplification | Keep | New Order |
| Tech stock | Correct simplification | Keep | New Order |
| Fresh before 8 AM | Correct domain assumption | Keep | ETA |
| Pricing / LKR absent | Correct | Keep absent | Whole Store system |
| Sunday handling absent | Wrong/ambiguous | Skip Sunday / non-operating day | Cutoff helper |
| Late issue absent | Incomplete | Add Late arrival | Receipt |

### Important note

Do not fake dataset integration if the CSVs are not actually in the prototype.

For the Designathon, it is enough to demonstrate that the UI fields **map to** dataset fields.

---

# 15. Cross-role data table

| Direction | Data | Current coverage | Needed improvement |
|---|---|---|---|
| Store → Dispatcher | Order ID, outlet, brand, category/temp requirement, items, units, quantities, requested day, submitted time | Strong | Add operating-date correctness |
| Dispatcher → Store | Order received, scheduled, ETA, trip, vehicle | Strong | Add outlet window context |
| Dispatcher → Store | Deferred + reason + new date | Strong | Add recourse + repeat-skip |
| Loader → Dispatcher | Missing/damaged before departure | Defined system-wide | No Store change required |
| Loader → Store | Expected shortfall warning | Partial | Show structured warehouse notice |
| Driver → Store | Arrived time | Partial/covered | Keep |
| Driver → Store | Delivered quantities | Weak | Add receipt prefill/source |
| Driver → Store | Driver shortfall reason | Gap | Add Driver record summary |
| Driver → Store | POD photo/signature | Gap | Add proof indicator |
| Store → Driver | Delivery PIN | Present but sequenced incorrectly | Reveal after goods check |
| Store → Dispatcher | Receipt confirmed | Covered conceptually | Keep |
| Store → Dispatcher | Issue report | Covered | Add report status |
| Store → Loader/Driver | Dispute/feedback | Not found | Low priority |

## Critical chain

The visual demo should make this exact story obvious:

```text
Store places order
→ Dispatcher schedules or defers
→ Loader records shortfall if needed
→ Driver arrives with delivery record
→ Store checks actual goods
→ Store reports discrepancy if needed
→ Store gives PIN
→ Driver verifies PIN
→ Receipt closes
```

---

# 16. Design consistency deviations

## Strong alignment

The prototype generally follows the WayLink design language:

- Daylight Store Manager surface,
- cobalt primary actions,
- emerald success,
- sunburst warnings,
- navy text,
- Inter/Poppins hierarchy,
- Lucide-style outline icons,
- restrained motion,
- rounded cards and pills.

## Deviations worth fixing

| Deviation | Impact | Action |
|---|---|---|
| Store offline/deferred changes are not always “never silent” | High | Add visible Store offline/queued states |
| PIN appears too early | High | Move to post-check handoff |
| Deferred can still feel like a separate page | High | Keep same Order Detail structure |
| Some mobile controls may be <48px | Medium | Fix only high-frequency controls |
| Store Manager lacks compact outlet constraint metadata | Medium | Add window/dock/access row |
| Desktop shell differs from early sidebar wireframe | Low | Do not rebuild |
| Blue desktop topbar differs from original navy spec | Low | Keep current product decision |

### Important

Do **not** spend time restoring old layout diagrams literally.

The design system is a guide; judge-facing operational clarity matters more than reproducing every early wireframe.

---

# 17. Documentation facts per page

## Home

**Purpose:** At-a-glance operational awareness.  
**Key elements:** Next delivery, needs attention, upcoming deliveries, recent activity, New Order action, prototype outlet type switch.  
**Visible decision:** Next delivery is prioritized.  
**Rationale:** Not stated as its own formal screen; logically part of My Deliveries.

## New Order

**Purpose:** Capture a structured, brand-appropriate order.  
**Key elements:** Product search, quantity controls, Fresh dry/chilled split, Style/Tech unified stock, cutoff context, live order summary.  
**Rationale:** Replace phone/message ordering and make submission status explicit.

## Review Order

**Purpose:** Give the manager a final check before submission.  
**Key elements:** Items, quantities, target run, cutoff notice, Edit and Submit.  
**Rationale:** Not separately stated; inferred from interaction flow.

## Submission Error

**Purpose:** Recover safely if order submission fails.  
**Key elements:** Error explanation, preserved selections, retry/back-to-edit.  
**Rationale:** Not stated.

## Order Confirmation

**Purpose:** Prove WayLink received the order.  
**Key elements:** Reference number, submitted timestamp, status, target delivery/planning run.  
**Rationale:** Explicit confirmation replaces uncertain phone/message ordering.

## Orders

**Purpose:** Search and review orders.  
**Key elements:** Search, filters, status/category labels, order cards.  
**Rationale:** Not formally stated.

## Deliveries

**Purpose:** Monitor operational delivery status.  
**Key elements:** Attention, active, upcoming, recent deliveries.  
**Rationale:** Gives ETA/status visibility so staff can be rostered.

## Order Detail

**Purpose:** Follow one order from confirmation through receipt.  
**Key elements:** Status, lifecycle, ETA, trip, vehicle, products, warning states.  
**Rationale:** Not stated as a separate paragraph.

## Deferred state

**Purpose:** Explain why service moved and when it is now expected.  
**Key elements:** Deferred status, reason, original date, revised date/window, optional repeat-skip warning, recourse.  
**Rationale:** Deferrals must never be silent and must be explainable.

## Verify Delivery

**Purpose:** Compare ordered vs received goods.  
**Key elements:** Item rows, received quantity, issue chips, note/photo, confirmation action.  
**Rationale:** Structured receipt replaces later memory-based disputes.

## PIN handoff

**Purpose:** Complete Store ↔ Driver proof-of-delivery handshake after goods checking.  
**Key elements:** Delivery-specific PIN, order ID, trip/vehicle, offline availability.  
**Rationale:** Team decision; closes proof-of-delivery loop.

---

# 18. Judging-criteria scores

| Criterion | Weight | Current score | After top fixes | Assessment |
|---|---:|---:|---:|---|
| Problem framing | 25% | 8.5/10 | 9.0 | Strong broken-information-chain framing |
| Understanding of user context | 20% | 7.5/10 | 8.8 | Offline + PIN sequence are the biggest missing context pieces |
| Degradation screen quality | 15% | 5.5–6.0/10 | 8.5 | Needs named Store degradation + recourse |
| Domain accuracy | 10% | 5.5–6.5/10 | 7.5 | Static time/date and weak outlet constraint linkage reduce score |
| Scope and prioritization | 15% | 8.5/10 | 9.0 | Good restraint; no unnecessary inventory/e-commerce system |
| Visual & interaction design | 15% | 8.5–9.0/10 | 9.0 | High-fidelity and polished; remaining issues are operational, not aesthetic |

### Current weighted estimate

Approximately **7.5–7.8 / 10**

### Realistic near-deadline target

Approximately **8.3–8.6 / 10**

The largest score gains come from fixing the **story of the system**, not adding more polish.

---

# 19. Top 10 prioritized fixes

Ranked by likely judging-score gain divided by implementation effort.

| Rank | Fix | File / Component | Exact change | Est. time | Score gain / effort |
|---:|---|---|---|---:|---|
| 1 | Fix PIN handoff sequence | `OrderDetailPage`, `ReceiptFlowPage` | Hide PIN at Arrived; reveal only after goods check; show order/trip/vehicle | 20–30 min | Very High |
| 2 | Make Deferred a true inline midpoint | `OrderDetailPage`, `OrderDetailLifecycle` | Same page/structure; insert Deferred between Confirmed and Scheduled | 20–30 min | Very High |
| 3 | Add deferral recourse | Deferred notice | Add Request priority + Contact dispatch | 10–15 min | Very High |
| 4 | Add consecutive-skip warning | Deferred notice | “Skipped previous run” / “Deferred again” chip | 10 min | High |
| 5 | Add Driver record summary to receipt | `ReceiptFlowPage` | Arrived/completed, driver outcome, shortfall, proof status | 20–30 min | High |
| 6 | Add late-arrival issue | Receipt issue types | Add order-level or issue-chip option | 10 min | High |
| 7 | Add Store offline degradation | Review / Receipt | Offline, queued, retry/sync state; PIN remains available | 25–35 min | High |
| 8 | Fix cutoff/domain date helper | Planning context | Asia/Colombo 16:00 + next operating day | 30–45 min | Medium-High |
| 9 | Add outlet receiving constraints | Order Detail | Window + dock/access metadata row | 15–20 min | Medium |
| 10 | Check high-frequency touch targets | `index.css` | Bring important mobile actions to ≥48px | 20–30 min | Medium |

---

# Recommended implementation order for today

If only a few hours remain:

## Must do

1. PIN after goods check
2. Deferred inline midpoint
3. Deferral recourse
4. Consecutive-skip warning
5. Driver record summary
6. Late-arrival issue

## Do next if time remains

7. Store offline / queued degradation state
8. Sri Lanka cutoff + operating-day helper
9. Outlet receiving constraints
10. Touch-target cleanup

---

# Final recommended Store Manager demo flow

Use this as the competition walkthrough:

### 1. Home
Show Next delivery first and explain that the manager immediately sees what is arriving and when.

### 2. New Order
Switch through Fresh / Style / Tech quickly to demonstrate brand-aware ordering.

For Fresh:
- Dry groceries
- Chilled & frozen

Explain the 4 PM cutoff.

### 3. Review + Order received
Submit and show the explicit reference number.

Explain:

> “Received does not mean scheduled yet.”

### 4. Scheduled
Open Order Detail.

Show:
- Scheduled
- ETA
- trip
- vehicle
- receiving window

### 5. Deferred degradation
From Order confirmed, demonstrate:

**Deferred → Scheduled**

without leaving the same page.

Show:
- reason,
- revised date/window,
- repeat-skip warning,
- recourse.

### 6. On the way
Show warehouse/loading warning while the primary status remains **On the way**.

### 7. Arrived
Confirm physical arrival.

Do **not** show the PIN yet.

### 8. Check goods
Compare ordered vs delivered line by line.

Show:
- good item,
- missing item,
- damaged item,
- business-specific issue,
- note/photo.

### 9. Driver record
Show driver/warehouse record context so the manager is not checking blind.

### 10. PIN handoff
Only after the goods check:

**Show delivery PIN → manager gives it to driver**

Explain that it is tied to this delivery and remains available offline.

### 11. Receipt complete
Show either:

- Receipt confirmed
- Receipt confirmed with issue

and status:

**Dispatcher reviewing** if an issue was reported.

---

# Final product verdict

The Store Manager prototype is already high-fidelity and visually mature enough for submission.

The remaining weaknesses are mostly **system-story gaps**:

- PIN appears at the wrong moment,
- Deferred still risks feeling like a separate experience,
- deferral lacks recourse,
- Driver/Loader evidence is not visible enough during receipt,
- Store offline behavior is missing,
- cutoff/date logic is still static,
- shared outlet constraints are not visible where they matter.

Fixing those areas will improve all of the following simultaneously:

- user-context understanding,
- degradation quality,
- domain accuracy,
- cross-role consistency,
- and problem framing.

Do **not** spend remaining time on major layout redesigns, new dashboards, or deeper architecture. The best submission is the current prototype with these operational gaps closed.
