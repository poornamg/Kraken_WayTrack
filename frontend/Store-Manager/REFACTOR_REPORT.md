# Store Manager Refactor Report

## 1. Summary
The Store Manager application (`frontend/Store-Manager`) has been successfully refactored from a monolithic ~4,650-line `App.tsx` into a modular, maintainable, domain-driven architecture.
- `App.tsx` was reduced to a **10-line thin shell** wrapping the `StoreProvider` and `AppShell`.
- State has been split by concern into `context/StoreContext.tsx` and custom reusable hooks (`hooks/`).
- Status content blocks (`components/order-detail/blocks/`) and receipt sub-views (`components/receipt/`) have been decomposed into dedicated components.
- Zero UI changes and zero behavior changes have been strictly preserved.
- Full-page pixel-by-pixel diff test verified **0 differences across all 54 baseline screenshot pairs** (100% pixel-perfect match).
- `tsc --noEmit` and `npm run build` pass with zero errors.

---

## 2. Before / After Metrics

### Bundle Size Comparison
- **Before Refactor**:
  - `dist/assets/index-hGKGnGFq.css`: 103.04 kB (gzip: 16.69 kB)
  - `dist/assets/App-DJS1Kn8A.js`: 4.91 kB (gzip: 1.61 kB)
  - `dist/assets/index-BwGzuq6G.js`: 223.33 kB (gzip: 70.23 kB)
- **After Refactor**:
  - `dist/assets/index-BUCnuIKP.css`: 103.33 kB (gzip: 16.77 kB)
  - `dist/assets/App-BIRqGUR7.js`: 231.91 kB (gzip: 68.59 kB)
  - `dist/assets/index-BXACWUrc.js`: 223.39 kB (gzip: 70.25 kB)

### TypeScript Verification
- **Before**: 13 type errors (`src/data/mockData.ts` and `src/types/index.ts` due to JSX syntax in non-TSX files).
- **After**: **0 errors** (`npx tsc --noEmit` exits with 0).

### Line Counts
- `App.tsx`: **4,648 lines -> 10 lines** (99.8% reduction)
- **Top 10 Largest Files**:
  1. `src/pages/FoundationsPage.tsx`: 326 lines (standalone styleguide / design token showcase)
  2. `src/pages/OrderDetailPage.tsx`: 263 lines
  3. `src/components/layout/AppShell.tsx`: 249 lines
  4. `src/components/layout/BottomNavigation.tsx`: 230 lines
  5. `src/context/StoreContext.tsx`: 217 lines
  6. `src/pages/NewOrderPage.tsx`: 214 lines
  7. `src/pages/ReceiptFlowPage.tsx`: 187 lines (down from 359 lines)
  8. `src/components/layout/TopBar.tsx`: 174 lines
  9. `src/pages/ReviewOrderPage.tsx`: 163 lines
  10. `src/components/receipt/ReceiptIssueRow.tsx`: 162 lines

---

## 3. Pixel-by-Pixel Visual Regression Results
Using automated Playwright captures and PIL pixel-difference analysis:
- **Baseline Directory**: `docs/refactor-baseline/store/`
- **Post-Refactor Directory**: `docs/refactor-after/store/`
- **Total Tested Scenarios**: 27 scenarios x 2 viewports (Desktop 1440x900 & Mobile 390x844) = **54 full-page screenshots**
- **Test Result**: **0/54 diffs detected. 100% of screenshots are pixel-identical.**

Tested scenarios:
1. `home_desktop_1440` & `home_mobile_390`
2. `new-order-fresh-dry_desktop_1440` & `new-order-fresh-dry_mobile_390`
3. `new-order-fresh-chilled_desktop_1440` & `new-order-fresh-chilled_mobile_390`
4. `new-order-style_desktop_1440` & `new-order-style_mobile_390`
5. `new-order-tech_desktop_1440` & `new-order-tech_mobile_390`
6. `new-order-empty_desktop_1440` & `new-order-empty_mobile_390`
7. `new-order-populated_desktop_1440` & `new-order-populated_mobile_390`
8. `new-order-before-cutoff_desktop_1440` & `new-order-before-cutoff_mobile_390`
9. `new-order-after-cutoff_desktop_1440` & `new-order-after-cutoff_mobile_390`
10. `review-default_desktop_1440` & `review-default_mobile_390`
11. `review-submission-error_desktop_1440` & `review-submission-error_mobile_390`
12. `confirmation_desktop_1440` & `confirmation_mobile_390`
13. `orders_desktop_1440` & `orders_mobile_390`
14. `deliveries_desktop_1440` & `deliveries_mobile_390`
15. `order-detail-confirmed_desktop_1440` & `order-detail-confirmed_mobile_390`
16. `order-detail-deferred_desktop_1440` & `order-detail-deferred_mobile_390`
17. `order-detail-scheduled_desktop_1440` & `order-detail-scheduled_mobile_390`
18. `order-detail-on-way_desktop_1440` & `order-detail-on-way_mobile_390`
19. `order-detail-arrived_desktop_1440` & `order-detail-arrived_mobile_390`
20. `order-detail-awaiting-confirmation_desktop_1440` & `order-detail-awaiting-confirmation_mobile_390`
21. `order-detail-receipt-confirmed_desktop_1440` & `order-detail-receipt-confirmed_mobile_390`
22. `order-detail-receipt-issue_desktop_1440` & `order-detail-receipt-issue_mobile_390`
23. `verify-delivery-good_desktop_1440` & `verify-delivery-good_mobile_390`
24. `verify-delivery-issue-edit_desktop_1440` & `verify-delivery-issue-edit_mobile_390`
25. `verify-delivery-issue-review_desktop_1440` & `verify-delivery-issue-review_mobile_390`
26. `verify-delivery-confirmed_desktop_1440` & `verify-delivery-confirmed_mobile_390`
27. `verify-delivery-confirmed-with-issue_desktop_1440` & `verify-delivery-confirmed-with-issue_mobile_390`

---

## 4. Old -> New File Map & Target Tree

```
src/
  App.tsx                               Thin shell (10 lines) wrapping StoreProvider and AppShell
  context/
    StoreContext.tsx                    Global state & router context (view, navigation, business, drafts, lifecycle)
  hooks/
    index.ts                            Public hook exports
    useBreakpoint.ts                    Responsive desktop vs mobile breakpoint detection
    useCutoff.ts                        Cutoff deadline logic and copy
    useOrderDraft.ts                    Order draft state, quantities, increment/decrement
    useOrderFilters.ts                  Orders search & status tab filtering
    useOrdersPolling.ts                 5-second polling of live store orders from backend
    useReceiptFlow.ts                   Delivery verification state, discrepancy quantities, remark, photo
  components/layout/
    AppShell.tsx                        Responsive shell orchestrating TopBar, main view transitions, BottomNavigation
    TopBar.tsx                          Desktop blue header and mobile top header
    BottomNavigation.tsx                Mobile liquid/magnetic drag navigation
    GlobalCutoff.tsx                    Global cutoff pill
    OutletIdentity.tsx                  Outlet badge & business switcher
    Sidebar.tsx                         Desktop navigation sidebar
    FloatingNewOrder.tsx                Mobile floating action button
    navigation.tsx                      Navigation constants
  components/orders/
    OrderCard.tsx                       Reusable order row card with status and metadata
    OrderFilters.tsx                    Filter chips and order ID search input
    index.ts                            Orders component exports
  components/order-detail/
    OrderDetailHero.tsx                 Hero status card delegating to modular status blocks
    OrderDetailLifecycle.tsx            Order progress stepper
    OrderActivity.tsx                   Audit trail activity list
    PrototypeStateControl.tsx           Dev state selector dropdown
    WarehouseIssueWarning.tsx           Discrepancy alert banner for loaded orders
    PinCard.tsx                         4-digit delivery verification code display
    blocks/
      ConfirmedContent.tsx              "Order received successfully" block
      DeferredContent.tsx               "Deferred" block
      ScheduledContent.tsx              "Scheduled" ETA block
      OnWayContent.tsx                  "Vehicle departed" tracking block
      ArrivedContent.tsx                "Verify delivery arrival" PIN verification block
      AwaitingContent.tsx               "Delivery awaiting confirmation" action block
      ReceiptConfirmedContent.tsx       "Receipt confirmed" block
      ReceiptIssueContent.tsx           "Receipt confirmed with issue" block
      index.ts                          Blocks index
  components/receipt/
    ReceiptVerifyView.tsx               Initial choice screen (Full receipt vs Issue path)
    ReceiptFullView.tsx                 Full receipt review & commit panel
    ReceiptIssueEditView.tsx            Product-by-product quantity & issue editor
    ReceiptIssueReviewView.tsx          Summary review of missing/damaged goods
    ReceiptSummary.tsx                  Delivery summary metrics presentation
    ReceiptReadOnlySummary.tsx          Read-only summary of products
    ReceiptGoodRows.tsx                 Non-issue items confirmation rows
    ReceiptIssueRow.tsx                 Interactive row with missing/damaged controls
    ReceiptConfirmationState.tsx        Success screen for receipt confirmation
    IssueChips.tsx                      Discrepancy reason tags (missing, damaged, temperature, etc.)
    index.ts                            Receipt components index
  components/home/
    NextDeliveryHero.tsx                Next delivery hero banner
    UpcomingDeliveryRow.tsx             Upcoming delivery table row
    UpcomingEmptyState.tsx              No upcoming deliveries empty card
    AttentionCard.tsx                   Deferred/issue attention callout
    RecentActivityList.tsx              Recent activity feed
    CutoffBanner.tsx                    Cutoff countdown warning
    HomeSectionHeader.tsx               Section header label
  components/new-order/
    OrderTypeSelector.tsx               Order category switch (Dry vs Chilled / Products)
    ProductSelectionRow.tsx             Product row with +/- quantity controls
    DesktopOrderSummary.tsx             Desktop sticky summary panel
    MobileOrderSummarySheet.tsx         Mobile bottom sheet summary
    OrderPlanningContext.tsx            Order schedule & cutoff context panel
    SummaryItems.tsx                    Selected items breakdown
    DirectQuantityControl.tsx           Direct numeric input for item counts
  components/review/
    ReviewProductList.tsx               Table of ordered products and quantities
    ReviewContext.tsx                   Order destination and target date meta
    SubmissionError.tsx                 Submission failure retry alert
    ConfirmationCard.tsx                Post-submission confirmation card
  components/ui/
    Button.tsx                          Button & IconButton components
    StatusPill.tsx                      Color-coded status badge
    SearchField.tsx                     Search input with icon
    BottomSheet.tsx                     Animated bottom sheet drawer
    Dialog.tsx                          Modal dialog
    Lifecycle.tsx                       Generic stepper component
    EtaBlock.tsx                        ETA time range block
    BrandMark.tsx                       Brand logo badge
    DeliveryCard.tsx                    Delivery card wrapper
    TextField.tsx                       Input field wrapper
    QuantityControl.tsx                 Stepper +/- controls
    Section.tsx                         Section container
    VerificationRow.tsx                 Row verification indicator
    ExampleCard.tsx                     Design preview card
    FormExamples.tsx                    Design preview forms
    MobileShellPreview.tsx              Mobile frame preview wrapper
    ProductRow.tsx                      Simple product row display
  constants/
    statusDetails.tsx                   Status labels and JSX icon mappings
    springs.tsx                         Framer-motion spring configurations
  data/
    productCatalog.ts                   Product catalogue items for Fresh, Style, and Tech
    mockDrafts.ts                       Mock prefilled drafts
    mockData.tsx                        Mock deliveries, activity feed, and helper accessors
    deferredData.tsx                    Legacy deferred mock data (preserved)
  types/
    index.ts                            Pure TypeScript type definitions
  utils/
    index.ts                            Formatting and calculation helpers
    constants.ts                        App constants
  pages/
    HomePage.tsx                        Dashboard page
    NewOrderPage.tsx                    Order creation page
    ReviewOrderPage.tsx                 Order review and submission page
    OrderConfirmationPage.tsx           Order confirmation page
    OrdersPage.tsx                      Orders list and tracking page
    DeliveriesPage.tsx                  Deliveries list and PIN verification page
    OrderDetailPage.tsx                 Unified order detail page
    ReceiptFlowPage.tsx                 Delivery receipt verification workflow
    FoundationsPage.tsx                 Design system foundations & tokens showcase
```

---

## 5. State Slices and Ownership
1. **Navigation Slice** (`StoreContext`):
   - `view`: Active screen router state (`home`, `orders`, `deliveries`, `new-order`, `review`, `confirmation`, `order-detail`, `verify-delivery`).
   - `currentNav`: Current bottom-navigation / top-bar tab (`Home`, `Orders`, `Deliveries`).
   - `navigate()`: Handles view switching and tracks directional slide transitions (`directionRef`).
   - `selectedOrderId`: ID of the order currently viewed in `OrderDetailPage` or `ReceiptFlowPage`.
2. **Business Identity Slice** (`StoreContext`):
   - `business`: Active retail outlet category (`fresh`, `style`, `tech`).
   - `handleBusinessChange()`: Synchronizes business brand, resets order drafts to default type, and fetches store context from backend (`/store/context`).
3. **Order Draft Slice** (`useOrderDraft`):
   - `orderType`: Active order category (`dry`, `chilled`, `products`).
   - `drafts`: Multi-category draft quantities mapped by product ID.
   - `incrementItem()`, `decrementItem()`, `setItemQuantity()`, `resetDrafts()`.
4. **Orders & Deliveries Polling Slice** (`useOrdersPolling`):
   - Polls `listStoreOrders(business)` every 5,000ms.
   - Provides live order updates, loading state, and manual refresh trigger.
5. **Receipt Workflow Slice** (`useReceiptFlow`):
   - `state`: Current receipt step (`verify`, `full`, `issue-edit`, `issue-review`, `confirmed`, `confirmed-issue`).
   - Tracks received amounts, damaged counts, issue categorization per product, remark text, and photo attachment state.
6. **Order Filters Slice** (`useOrderFilters`):
   - Filters order list by search text (ID / order number) and lifecycle status chips.

---

## 6. Cleanup Candidates
1. **`frontend/Store-Manager/old-App.tsx`**:
   - An old 122-line file at the root of `Store-Manager`. Unused by any import, safe to delete in a subsequent maintenance cleanup.
2. **`src/data/deferredData.tsx`**:
   - Legacy mock data (`deferredProducts`, `deferredStages`) from early prototypes. Preserved per Rule 5; can be decommissioned when legacy views are formally deprecated.
3. **`src/pages/FoundationsPage.tsx`**:
   - 326-line design system token showcase. Not part of the production store manager flow, but useful for design verification.
4. **Root Temporary CJS Scripts**:
   - Test scripts (`test_final.cjs`, `test_drag.cjs`, etc.) located in `frontend/Store-Manager/` can eventually be migrated to formal Playwright tests under `tests/`.

---

## 7. Where Things Live (Developer Quick Reference)
- **Top-level Shell**: `src/App.tsx` and `src/components/layout/AppShell.tsx`.
- **Global State & Router**: `src/context/StoreContext.tsx` (access via `useStore()`).
- **Domain Hooks**: `src/hooks/` (`useOrderDraft`, `useCutoff`, `useOrdersPolling`, `useOrderFilters`, `useReceiptFlow`, `useBreakpoint`).
- **Pages / Screens**: `src/pages/` (`HomePage`, `NewOrderPage`, `ReviewOrderPage`, `OrderConfirmationPage`, `OrdersPage`, `DeliveriesPage`, `OrderDetailPage`, `ReceiptFlowPage`).
- **Order Status Blocks**: `src/components/order-detail/blocks/` (`ConfirmedContent`, `DeferredContent`, `ScheduledContent`, `OnWayContent`, `ArrivedContent`, `AwaitingContent`, `ReceiptConfirmedContent`, `ReceiptIssueContent`).
- **Receipt Workflow Views**: `src/components/receipt/` (`ReceiptVerifyView`, `ReceiptFullView`, `ReceiptIssueEditView`, `ReceiptIssueReviewView`).
- **Data & Catalogues**: `src/data/productCatalog.ts`, `src/data/mockDrafts.ts`, `src/data/mockData.tsx`.
- **Types & Constants**: `src/types/index.ts`, `src/constants/statusDetails.tsx`, `src/constants/springs.tsx`.
- **API Services**: `src/services/store.ts` and `src/services/client.ts`.
