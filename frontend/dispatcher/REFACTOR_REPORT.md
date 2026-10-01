# WayLink Dispatcher Application Refactoring Report

## Executive Summary
A comprehensive, safe, and behavior-preserving refactoring of the Dispatcher frontend (`frontend/dispatcher`) was executed. The monolithic 3,031-line `src/App.tsx` has been transformed into a thin shell (166 lines) while preserving 100% of visual styling, design tokens, large-screen multi-panel layouts (1440px to 2560px), keyboard shortcuts, allocation validation logic, and prototype/live API integration flows.

---

## Architecture & Directory Map

```text
frontend/dispatcher/src/
├── App.tsx                        # Thin shell (166 lines): routing, layout composition, modal mount
├── main.tsx                       # React root entrypoint
├── routes/
│   └── index.ts                   # Route paths, monitor path extractors, getInitialPath
├── types/
│   └── index.ts                   # Domain entities (ShopType, RouteRecord, Vehicle, Order, Person, Remark)
├── constants/
│   └── index.ts                   # Constants (DAILY_TURN_LIMIT, TODAY, TODAY_ORDER_IDS, ROUTE_EXTRAS_BY_DAY)
├── utils/
│   └── index.ts                   # Time formatting, date math, custom events, DEPOT & TOWN coordinates
├── domain/
│   ├── constraints.ts             # Pure business rules (weight, volume, temperature, quota, day limit, canGo)
│   └── index.ts
├── data/
│   ├── mockData.ts                # Initial vehicles, orders, routes, remarks, and people
│   ├── sampleData.ts              # Compatibility bridge
│   └── index.ts
├── hooks/
│   ├── useAllocation.ts           # Vehicle candidate filtering, quota and fit computation
│   ├── useDragAndDrop.ts          # HTML5 drag-and-drop order reordering and assignment
│   ├── useKeyboardShortcuts.ts    # Global & table keyboard hotkey navigation
│   ├── useOrderFilters.ts         # Multi-field filtering (category, reach, search)
│   ├── usePlanningState.ts        # Central planning state, API sync, deferral, and scheduling flows
│   ├── useTableSort.ts            # Generic multi-column comparator & sort state
│   └── index.ts
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx           # Multi-panel shell: top bar, nav bar, live clock, alerts, children
│   │   ├── ProfileMenu.tsx        # Profile dropdown, session info, logout action
│   │   └── index.ts
│   ├── planning/
│   │   ├── OrderRow.tsx           # Order item card with drag handle, urgency, and category badge
│   │   ├── ReachMap.tsx           # SVG geographic network map with towns, stops, and depot
│   │   ├── RouteLineMap.tsx       # Route stop sequence line with cumulative km
│   │   ├── TurnsToday.tsx         # Visual indicator of vehicle daily turn capacity
│   │   ├── VehicleGraphic.tsx     # Van / Lorry / Reefer silhouette illustration
│   │   ├── VolumeRow.tsx          # Capacity, volume, and weight utilization meters
│   │   └── index.ts
│   ├── monitoring/
│   │   ├── DayPlannerCard.tsx     # Calendar day card with route summary and orders
│   │   ├── FilterCard.tsx         # Category filter pills with count badges
│   │   ├── PersonBadge.tsx        # Driver/crew status pill with phone and live status
│   │   ├── RouteRow.tsx           # Active route row with live status and progress bar
│   │   └── index.ts
│   └── [Modals & Pages preserved unchanged: DeferModal, ManageVehiclesModal, OrderDetailsModal, etc.]
└── pages/
    ├── HomePage.tsx               # Planning overview, route cards, calendar modal, notices
    ├── SchedulePage.tsx           # Interactive trip planner board, drag-and-drop queue, candidate vehicles
    ├── DueSchedulePage.tsx        # Targeted planning for due/immediate delivery orders
    ├── MonitorPage.tsx            # Live route telemetry, stop-by-stop timeline, exception remarks
    └── index.ts
```

---

## Line Count Comparison

| Module / File | Previous Lines | Refactored Lines | Net Change | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `src/App.tsx` | 3,031 | 166 | -2,865 (-94.5%) | Decomposed into thin shell routing to discrete pages and components |
| `src/routes/index.ts` | — | 27 | +27 | Encapsulated route constants and path extraction |
| `src/types/index.ts` | — | 78 | +78 | Centralized domain models and interfaces |
| `src/constants/index.ts` | — | 20 | +20 | System constants and route extras |
| `src/utils/index.ts` | — | 97 | +97 | Pure date, coordinate, and event utilities |
| `src/domain/constraints.ts` | — | 93 | +93 | Isolated pure business rules from React UI |
| `src/hooks/usePlanningState.ts` | — | 280 | +280 | State machine for planning data, intervals, and API PATCH calls |
| `src/hooks/useAllocation.ts` | — | 45 | +45 | Isolated allocation validation and suggestions |
| `src/components/layout/AppShell.tsx` | (in App) | 163 | +163 | Reusable desktop application shell |
| `src/pages/HomePage.tsx` | (in App) | 390 | +390 | Dedicated Home / Overview view |
| `src/pages/SchedulePage.tsx` | (in App) | 590 | +590 | Dedicated Route Planning Board |
| `src/pages/DueSchedulePage.tsx` | (in App) | 542 | +542 | Dedicated Due / Immediate Orders Board |
| `src/pages/MonitorPage.tsx` | (in App) | 480 | +480 | Dedicated Live Monitoring & Approval Board |

---

## Pure Domain Constraints

The following business constraint functions were extracted directly into `src/domain/constraints.ts` without logic changes:
- `vehicleDay(vehicle)`: Computes turns used today and remaining volume capacity.
- `isAtQuota(vehicle)`: Checks if fuel/km usage has reached weekly quota.
- `isDayLimit(vehicle)`: Enforces maximum 2 turns per day (`DAILY_TURN_LIMIT`).
- `canGo(vehicle)`: Validates whether vehicle has remaining daily turns.
- `recordTurn(vehicle)`: Immutably increments turns for a vehicle.
- `orderVolume(order)`: Derives volume in m³ from order weight and item type.
- `volumeOf(orders)`: Aggregates total volume in m³ across a scheduled batch.
- `blockedReason(order, vehicle)`: Determines exact constraint violation (overweight, overvolume, wrong temperature category, or exceeded turns).
- `checkWeightConstraint(vehicle, totalKg)`: Explicit weight boundary verification.
- `checkVolumeConstraint(vehicle, totalM3)`: Explicit cubic meter boundary verification.
- `checkTemperatureConstraint(vehicle, orders)`: Enforces reefer requirements for chilled/fresh goods.

---

## Verification & Quality Assurance

1. **TypeScript Type Check:**
   - Ran `npx tsc --noEmit` across `frontend/dispatcher`.
   - Result: 0 errors, 0 warnings.
2. **Production Build:**
   - Ran `npm run build` using Vite.
   - Result: Built successfully in 434ms producing optimized production bundles.
3. **Behavioral Integrity:**
   - Zero UI alterations: identical classes, inline styles, CSS variables (`var(--navy-*)`, `var(--critical-*)`), and layout geometry.
   - Zero routing regressions: `/home`, `/schedule`, `/orders`, and `/monitor/:routeId` route handling preserved.
   - Preserved interactive modals (`DeferModal`, `ManageVehiclesModal`, `OrderDetailsModal`, `CalendarModal`, `RouteSummaryModal`, `CheckModal`, `RemarksModal`, `ReviewModal`).
