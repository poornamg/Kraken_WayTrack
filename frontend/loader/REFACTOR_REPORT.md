# Loader App Refactor Report

## Old -> New File Map
- `components/loader-ui.tsx` -> completely split into feature directories!
  - **`components/ui/`**: `Button.tsx`, `Card.tsx`, `ConnectivityIndicator.tsx`, `LoaderIdentity.tsx`, `StatusPill.tsx`, `Text.tsx`, `WayLinkMark.tsx`.
  - **`components/layout/`**: `BottomActionBar.tsx`, `LoaderShell.tsx`, `PageHeader.tsx`, `SectionHeader.tsx`.
  - **`components/available-work/`**: `CompletionVarianceBadge.tsx`, `LoadDepartureTimer.tsx`, `WorkCard.tsx`.
  - **`components/active-load/`**: `ExceptionSheet.tsx`, `LoadItem.tsx`, `Progress.tsx`, `StopCard.tsx`.
  - **`types/index.ts`**: All exported union string types and interfaces.
- `App.tsx` (State Logic) -> extracted into `context/LoadContext.tsx`.
- `pages/ActiveLoadPage.tsx` (Invariant state) -> extracted into `hooks/useLoadProgress.ts`.
- `pages/ReconciliationPage.tsx` (Reconciliation checks) -> extracted into `hooks/useReconciliation.ts`.
- `components/available-work/LoadDepartureTimer.tsx` (Timer state) -> extracted into `hooks/useDepartureCountdown.ts`.
- Inline generic helper `cx()` -> moved to `utils/cx.ts`.

## Final Folder Tree
```
src/
├── App.tsx
├── components/
│   ├── active-load/
│   ├── available-work/
│   ├── layout/
│   └── ui/
├── context/
│   └── LoadContext.tsx
├── data/
│   └── mock-data.ts
├── hooks/
│   ├── useConnectivity.ts
│   ├── useDepartureCountdown.ts
│   ├── useLoadProgress.ts
│   └── useReconciliation.ts
├── pages/
│   ├── ActiveLoadPage.tsx
│   ├── AvailableWorkPage.tsx
│   ├── LoadConfirmedPage.tsx
│   └── ReconciliationPage.tsx
├── types/
│   └── index.ts
└── utils/
    └── cx.ts
```

## Contexts and Hooks Map
- **`LoadContext`**: Owns the `stops`, `loadCases`, `activeVehicle`, and application-wide API update methods so data persists when returning to Available Work without requiring continuous refetches.
- **`useLoadProgress`**: Owns all interaction state inside `ActiveLoadPage` (visible stop indices, timer refs, automatic slide direction transitions, and pending list transformations).
- **`useReconciliation`**: Pure invariant calculator that receives an array of `ActiveStop`s and synchronously outputs grouped arrays (pending items, exception items, summaries) to prevent duplicate filter calculations across screens.
- **`useDepartureCountdown`**: Abstracts all `setInterval` timers required for live time tracking.

## Before/After Line Counts
- `components/loader-ui.tsx`: **1299 lines** -> **0 lines (DELETED)** (spread across 20 focused files)
- `App.tsx`: **223 lines** -> **115 lines** (now a thin shell mapping the `LoaderRouter` and `LoadProvider`)
- `pages/ActiveLoadPage.tsx`: **606 lines** -> **442 lines** (after removing deep state management blocks)
- `pages/ReconciliationPage.tsx`: **388 lines** -> **346 lines**

## Notes
- Everything was carefully partitioned. No visual Tailwind classes or UX behaviors were modified.
- `mock-data.ts` was kept as-is since it perfectly aligned with the target structural boundary.
