# WayLink Loader — Design Decisions & Assumptions

## 1. Loader Role & Operating Context

The Loader experience is designed for warehouse staff who execute the physical loading of assigned vehicles. The Loader is responsible for carrying out the work plan provided by the dispatch process, accounting for expected quantities, recording shortfalls or damage, and confirming when the load has been fully accounted for.

The interface is designed primarily for a shared warehouse tablet and therefore prioritises fast recognition, large touch targets, high contrast, minimal typing, and clear operational states.

### 1.1 Loader responsibilities

The Loader experience supports the following responsibilities:

- Discover and claim assigned loading work.
- Review the vehicle, route, bay, departure time and load information.
- Load goods according to the required reverse delivery sequence.
- Account for every expected quantity as loaded or as an exception.
- Record missing or damaged quantities with a reason.
- Respond explicitly to changes made to the loading plan.
- Review the completed load and its exceptions.
- Confirm that loading has been accounted for.

### 1.2 Responsibility boundaries

The Loader UI deliberately does not duplicate planning responsibilities that belong upstream.

- Route planning and allocation are dispatcher responsibilities.
- Vehicle allocation and planning constraints are treated as upstream decisions.
- The Loader executes the assigned plan rather than redesigning it.
- Load confirmation is separate from vehicle release.

This boundary keeps the Loader experience focused on physical execution rather than exposing unnecessary planning complexity.

---

## 2. Design Principles

### 2.1 Execution over planning

The Loader needs to know **what to do next**, rather than understand or modify the entire dispatch plan. The interface therefore prioritises the current actionable work while keeping the surrounding load context available.

### 2.2 One actionable stop at a time

The Active Load experience presents the loading sequence progressively, allowing the Loader to focus on the current stop instead of navigating a dense list of every stop simultaneously.

A completed stop is visibly marked, while the next required stop becomes the active task.

### 2.3 Reverse loading sequence

Goods are loaded in reverse delivery order: the last delivery stop is loaded first and the first delivery stop is loaded last.

This reflects the physical relationship between loading and subsequent unloading: goods needed first should remain accessible after goods for later stops have been loaded.

The UI makes this sequence explicit through the stop ordering and supporting labels rather than requiring the Loader to infer it.

### 2.4 Every quantity must be accounted for

A quantity cannot simply disappear from the workflow.

Each expected quantity must ultimately be represented as either:

- loaded, or
- explicitly flagged as an exception.

This produces a clear accounting boundary before confirmation.

### 2.5 Never silently change the working plan

A Loader may already be physically working from a load list when a dispatcher changes the plan.

The system therefore treats a plan change as an explicit operational event. The change is surfaced visibly, the affected work is identified, and the Loader must acknowledge it rather than having the working plan silently change underneath them.

### 2.6 Explicit completion and handoff

The interface distinguishes between:

1. all quantities being accounted for,
2. loading being confirmed, and
3. the vehicle being released.

These are related but different operational events.

---

# 3. Screen Architecture

## 3.1 Available Work

**Purpose:** Allow the Loader to discover and claim available loading work.

### Key states

- Available work
- Refreshing
- Empty
- Offline
- Claimed by the current Loader
- Already assigned
- Completed

### Design decisions

- Urgent loads are prioritised before normal loads.
- A load already assigned to another Loader remains visible but cannot be claimed.
- A load claimed by the current Loader remains associated with that Loader when the user navigates away and returns.
- Completed work remains visible so that ownership and completion status are clear.
- Each load maintains its own departure countdown; claiming a load does not restart its timer.

The purpose is to prevent accidental double assignment while making the most operationally important work immediately visible.

---

## 3.2 Active Load

**Purpose:** Execute the physical loading workflow.

### Key states

- In progress
- Offline
- Syncing / synced
- Exception entry
- Plan change
- All quantities accounted for

### Design decisions

The Active Load screen presents the load hierarchy:

**Vehicle → Route → Stop → Order → Item**

The Loader progresses through stops in reverse delivery order. The current stop is the primary focus, while completed stops remain visibly completed.

The screen also provides:

- Load progress
- Departure timing
- Current stop
- Item quantities
- Load actions
- Exception actions
- Connectivity status
- Plan-change acknowledgement when required

The Loader is not required to navigate back through completed work to understand progress.

---

## 3.3 Reconciliation

**Purpose:** Review the final accounting state before load confirmation.

The reconciliation screen makes the relationship between loaded, flagged and pending quantities explicit.

The core invariant is:

> **Loaded + Flagged + Pending = Expected**

Confirmation is permitted only when:

> **Pending = 0**

Exceptions remain visible so that the Loader can review what was not successfully loaded and why.

---

## 3.4 Load Confirmed

**Purpose:** Provide a clear final state after loading has been accounted for and confirmed.

The screen provides:

- Load summary
- Confirmation timestamp
- Loaded quantity
- Flagged quantity
- Completion timing variance
- Exception summary where applicable
- Confirmation record/PDF generation

A deliberate distinction is maintained:

> **Load confirmed · Vehicle not yet released**

The Loader confirms the physical loading workflow; vehicle release remains a separate operational decision.

---

# 4. Key Design Decisions

## 4.1 Work prioritisation

Urgent loading work is presented before normal work.

This reduces the time required for a Loader to identify which available job needs attention first without hiding other work states such as already-assigned or completed loads.

---

## 4.2 Stop sequencing

The loading workflow follows reverse delivery order.

The interface communicates this directly using the sequence and supporting labels:

> **Last stop → First stop**

The current stop is made actionable while completed stops are represented with a clear completion state.

The design avoids relying on the physical ordering of mock data alone; the conceptual rule is based on the stop number and delivery sequence.

---

## 4.3 Item accounting

Each item has an explicit state.

A quantity can be:

- Pending
- Loaded
- Flagged

The system derives overall completion from these states rather than relying on a separate manual "completed" flag.

This prevents a load from appearing complete while an expected quantity is still unaccounted for.

---

## 4.4 Shortfall and damage handling

When an item cannot be loaded as expected, the Loader can open an exception flow.

The exception flow distinguishes between:

### Missing

Examples include:

- Short quantity
- Cannot locate
- Stock unavailable

### Damaged

Examples include:

- Damaged during handling
- Damaged before loading
- Packaging damaged

The Loader records the affected quantity and a reason, with an optional note where additional context is useful.

An exception counts as **accounted for**, but it remains visible during reconciliation so that downstream users can understand the difference between what was expected and what was actually loaded.

---

## 4.5 Departure countdown

Departure timing is a property of the **load**, not of an individual order or stop.

Each load therefore has its own countdown based on its system-received time and scheduled departure time.

The same timing state follows the load through:

**Available Work → Active Load → Reconciliation → Load Confirmed**

The countdown remains live while the load is incomplete.

When the entire load becomes accounted for, the live countdown stops and the completion variance is captured at that moment.

---

## 4.6 Completion variance

The final timing result is represented as a load-level completion variance.

- Positive variance indicates completion before scheduled departure.
- Negative variance indicates completion after scheduled departure.

Once captured, the value is frozen and reused throughout the remaining workflow. It is not recalculated independently on each screen.

This prevents the displayed completion result from changing after the load has already been completed.

The compact visual treatment communicates both the value and its meaning:

- `✓ +MM:SS` for early completion
- `⚠ -MM:SS` for late completion

---

## 4.7 Load confirmation versus vehicle release

The Loader's responsibility ends at confirming that the assigned loading work has been accounted for.

The prototype intentionally does not interpret this action as permission to release the vehicle.

This distinction prevents a physical loading confirmation from being confused with a dispatch or operational release decision.

---

# 5. Degradation & Failure Handling

## 5.1 Offline operation

Warehouse connectivity may be interrupted during physical work.

The Loader UI therefore exposes connectivity state instead of silently behaving as though the system were online.

The prototype represents locally recorded work as pending synchronisation where applicable and communicates the offline condition directly to the Loader.

The production implementation would require a real synchronisation mechanism; the prototype demonstrates the intended user experience and state model rather than claiming a complete backend sync implementation.

---

## 5.2 Plan changes during active loading

A plan change is different from an offline condition.

Offline operation concerns **connectivity**.

A plan change concerns the **validity of the work the Loader is currently performing**.

For this reason, a plan change is surfaced as a business-state event that requires explicit acknowledgement.

The Loader must not be expected to notice a changed list by comparing it manually with the previous state.

---

## 5.3 Deferred order scenario

A representative degradation scenario is a dispatcher deferring an order after the Loader has already opened the active load.

For example:

> **OUT019 — Deferred — Reefer shortage**

The Loader receives a visible plan-change indication identifying the affected order and the reason for the change.

The change is not silently applied.

The Loader explicitly acknowledges the plan change before continuing.

---

## 5.4 Preservation of loading progress

A plan change must not destroy progress that has already been recorded.

If an item or order remains part of the updated plan, its previously recorded loading state should be retained.

The Loader therefore does not have to restart the physical loading process merely because the dispatch plan changed.

---

## 5.5 Completion gating during a plan change

While a plan change remains unacknowledged, the Loader cannot silently proceed to completion.

The purpose of this gate is not to punish the Loader or block normal work unnecessarily. It ensures that the person physically loading the vehicle has explicitly seen and accepted the updated operational information before confirming the final state.

---

# 6. Cross-Role Information Flow

WayLink treats the load as shared operational information viewed through different role-specific interfaces.

## 6.1 Dispatcher → Loader

The Loader receives:

- Assigned vehicle
- Route
- Bay
- Scheduled departure
- Stops
- Orders
- Expected quantities
- Plan changes

The Loader does not modify the underlying dispatch plan.

---

## 6.2 Loader → Dispatcher

The Loader produces:

- Item accounting
- Loaded quantities
- Missing quantities
- Damaged quantities
- Exception reasons
- Load confirmation
- Completion timestamp / timing variance

These outputs provide the dispatch process with the actual physical state of the load.

---

## 6.3 Loader → Driver

The Loader's completion and exception information represents the operational state that can be handed to the driver.

The current frontend prototype models this information flow but does not claim a complete production backend integration.

---

## 6.4 Driver → Store Manager

The Driver's delivery record provides the downstream operational information required by the Store Manager.

The Loader experience therefore forms part of a larger chain rather than functioning as an isolated screen set:

> **Dispatcher decision → Loader execution → Driver delivery → Store Manager action**

---

# 7. Physical & Interaction Design

## 7.1 Tablet-first layout

The primary Loader device is treated as a warehouse tablet rather than a desktop workstation.

The layout therefore prioritises:

- large controls
- clear hierarchy
- limited simultaneous decisions
- strong status visibility
- responsive landscape/portrait behaviour

---

## 7.2 Touch targets

Primary actions use large touch targets suitable for operation on a tablet.

The design avoids making critical actions dependent on small controls or precise pointer interaction.

Carousel navigation and secondary controls should remain large enough to be reliably used during physical work.

---

## 7.3 Visibility and contrast

The Loader may operate in a bright warehouse environment.

The interface therefore uses strong contrast and clear state differentiation so that important information can be identified quickly without requiring prolonged reading.

---

## 7.4 Minimal typing

Typing is deliberately minimised.

Most Loader actions are selection or confirmation actions rather than free-form data entry.

Where quantities or exception details must be entered, the interaction should favour direct touch controls and concise inputs over keyboard-heavy workflows.

---

## 7.5 Shared-device considerations

The tablet may be used by multiple Loaders.

The prototype therefore provides explicit Loader identity and a sign-out mechanism.

Automatic session expiry is not assumed as a fixed five-minute policy because the correct timeout depends on the operational environment and device-handling process.

A production deployment should define an appropriate session and handoff policy.

---

# 8. Data & State Invariants

## 8.1 Load accounting invariant

For every load:

> **Loaded + Flagged + Pending = Expected**

This invariant is maintained throughout the Active Load and Reconciliation workflow.

---

## 8.2 Completion invariant

A load is considered fully accounted for only when:

> **Pending = 0**

This can occur through successful loading, recorded exceptions, or a combination of both.

---

## 8.3 Ownership state

Claiming a load establishes Loader ownership.

The ownership state persists when navigating between the Available Work and Active Load experiences.

A load already assigned to another Loader cannot be claimed by the current Loader.

---

## 8.4 Timing state

The departure timer belongs to the load.

The final completion variance is captured once, when the entire load becomes accounted for, and then persisted through the remaining screens.

This prevents different screens from calculating different completion results.

---

## 8.5 Plan-change acknowledgement

A detected plan change has an explicit acknowledgement state.

The operational change is not treated as silently accepted merely because the underlying data has changed.

---

# 9. Prototype Scope & Assumptions

The Loader prototype demonstrates the intended interaction model and operational states. It does not represent a complete production logistics platform.

## 9.1 Mocked data

The prototype uses representative mock data for:

- Loads
- Vehicles
- Routes
- Stops
- Orders
- Items
- Loader identity
- Exceptions
- Timing

These values are used to demonstrate the workflow rather than to represent live operational records.

---

## 9.2 Frontend prototype boundaries

The prototype demonstrates the frontend behaviour of the Loader workflow.

Some downstream effects, including actual backend synchronisation and cross-role data transmission, are represented through local application state.

The documentation therefore distinguishes between:

- behaviour demonstrated by the prototype, and
- integrations that would be implemented in a production system.

---

## 9.3 Planning responsibility boundary

The Loader does not perform dispatch planning.

Capacity validation, route allocation, vehicle assignment and similar planning constraints are treated as upstream responsibilities unless the Loader specifically needs to be informed of their outcome.

This avoids duplicating planning logic inside the execution interface.

---

## 9.4 Known limitations

The prototype has the following known boundaries:

1. Production backend synchronisation is not represented as a complete live service.
2. Offline state and pending synchronisation are demonstrated at the UI/state level rather than as a complete background sync implementation.
3. Cross-role notifications are represented conceptually where the prototype does not have the corresponding backend service.
4. Session timeout policy is left for the deployment environment to define.
5. Vehicle planning constraints are not duplicated inside the Loader interface.
6. Mock identifiers and product quantities are representative rather than production master data.

These limitations describe prototype scope rather than intended production behaviour.

---

# 10. Designathon Requirement Traceability

| Requirement / design need | Loader response | Evidence |
|---|---|---|
| Loader persona and operational context | Tablet-first warehouse execution model | Loader Shell and role-specific workflow |
| Screen flow | Available Work → Active Load → Reconciliation → Load Confirmed | Four primary Loader screens |
| Reverse loading order | Last stop → First stop | Active Load sequence |
| Shortfall / damage handling | Explicit quantity and reason-based exception flow | Exception Sheet |
| Every quantity accounted for | Loaded + Flagged + Pending = Expected | Active Load and Reconciliation |
| Plan changes | Visible change requiring explicit acknowledgement | Active Load plan-change state |
| Degradation | Offline state plus plan-change handling | Loader Shell / Active Load |
| Completion timing | Load-level departure countdown and frozen final variance | Available Work, Active Load, Reconciliation, Load Confirmed |
| Cross-role continuity | Dispatcher plan → Loader execution → downstream operational state | Shared load data model |
| Final confirmation | Explicit load confirmation separate from vehicle release | Load Confirmed |
| High-fidelity interaction | Tablet-oriented touch UI with explicit operational states | Loader prototype |

---

# 11. Summary of the Loader Design Rationale

The Loader experience is intentionally designed as an **execution interface rather than a planning interface**.

The core design logic is:

> **Find the assigned work → load in reverse delivery order → account for every quantity → explicitly handle exceptions and plan changes → reconcile → confirm loading**

The interface keeps the Loader focused on the next physical action while preserving enough context to understand the vehicle, route, departure deadline and overall load state.

The most important safety principle is **never silently change the Loader's working reality**. This applies both to connectivity and to dispatcher plan changes. Offline conditions are made visible, while business-state changes require explicit acknowledgement.

The final state also remains deliberately precise: **the Loader confirms that loading is accounted for; that action does not itself release the vehicle.**

This separation of responsibilities allows the Loader experience to remain simple enough for rapid warehouse execution while still contributing reliable information to the wider WayLink workflow.
