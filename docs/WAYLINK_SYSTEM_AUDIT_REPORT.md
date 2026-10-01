# WayLink System Audit: Plan Documents vs. Real Codebase

## 1. Executive Summary

* **Overall UI / Prototype Completeness:** **58.81%**
* **Overall Functional / Integration Completeness:** **51.25%**
* **Architecture Reality:** The system is split across a Fastify/MongoDB backend and 5 independent Vite React frontends. A backend with MongoDB collections exists, but cross-role data flow is fractured into two parallel universes: an official schema pipeline (`Order` → `Trip` → `LoadRecord` → `DeliveryRecord`) and an ad-hoc unauthenticated pipeline (`UnifiedOrder`).
* **Single Biggest Blocker:** **Broken Planning → Loading handoff.** When the Dispatcher publishes a schedule, `publishSchedule` only executes a `PATCH` on `/api/v1/unified/orders/:id` and never calls the backend trip creation API (`POST /api/v1/planning/trips`). Consequently, no `Trip`, `LoadRecord`, or `DeliveryRecord` is ever created, causing the Loader, Driver, and Store Manager receipt workflows to operate on static mock data.
* **Most Important Next Step:** Connect Dispatcher route publishing to `POST /api/v1/planning/trips` and generate `LoadRecord` entries so published trips flow directly into the Loader work queue and Driver today's routes.

---

## 2. Codebase Reality Check

### Folder Structure (2–3 Levels)
```text
/home/malith-sandanayake/projects/hackathon-host/
├── backend/
│   ├── src/
│   │   ├── app.ts                         (Fastify entry, CORS, auth, swagger)
│   │   ├── server.ts                      (Process bootstrap)
│   │   ├── config/                        (env.ts, connection.ts)
│   │   ├── middleware/                    (auth.ts, errors.ts)
│   │   ├── models/                        (index.ts [Mongoose schemas], unifiedOrder.ts)
│   │   ├── routes/                        (auth, driver, files, loading, operations, orders, planning, reference, unified-orders)
│   │   ├── services/                      (planningConstraints.ts)
│   │   └── utils/                         (audit.ts, crypto.ts, seed/, time.ts)
│   └── package.json                       (Fastify 5.6.1, Mongoose 8.19.1, Luxon, Argon2)
├── frontend/
│   ├── Login/
│   │   ├── src/
│   │   │   ├── App.tsx                    (Router shell)
│   │   │   ├── auth/                      (api.ts, mockApi.ts, roles.ts, types.ts, validation.ts)
│   │   │   └── pages/auth/                (AuthLayout.tsx, LoginPage.tsx)
│   │   └── package.json                   (React 19, Tailwind v4, Vite 8)
│   ├── Store-Manager/
│   │   ├── src/
│   │   │   ├── App.tsx                    (Store Manager UI monolith: Home, New Order, Orders, Deliveries, Receipt)
│   │   │   ├── auth/                      (AuthBoundary.tsx, session.ts)
│   │   │   └── services/                  (client.ts, store.ts)
│   │   └── package.json                   (React 19, Motion, Lucide, Tailwind v4, Vite 8)
│   ├── dispatcher/
│   │   ├── src/
│   │   │   ├── App.tsx                    (Dispatcher planning & monitoring workspace)
│   │   │   ├── auth/                      (AuthBoundary.tsx, session.ts)
│   │   │   ├── components/                (CalendarModal, CheckModal, DeferModal, ManageVehiclesModal, OrderLogPage, ReviewModal)
│   │   │   ├── data/                      (sampleData.ts)
│   │   │   └── services/                  (client.ts, planning.ts)
│   │   └── package.json                   (React 19, Lucide, Tailwind v4, Vite 8)
│   ├── loader/
│   │   ├── src/
│   │   │   ├── App.tsx                    (Loader application shell)
│   │   │   ├── auth/                      (AuthBoundary.tsx, session.ts)
│   │   │   ├── components/                (loader-ui.tsx)
│   │   │   ├── data/                      (mock-data.ts)
│   │   │   ├── pages/                     (ActiveLoadPage, AvailableWorkPage, LoadConfirmedPage, ReconciliationPage)
│   │   │   └── services/                  (client.ts, loads.ts)
│   │   └── package.json                   (React 19, Lucide, Tailwind v4, Vite 8)
│   └── delivery-driver/
│       ├── src/
│       │   ├── app/App.tsx                (Driver application root)
│       │   ├── auth/                      (AuthBoundary.tsx, session.ts)
│       │   ├── api/                       (client.ts, driver.ts)
│       │   ├── components/screens/        (Login, MapNavigation, MarketDetail, MeterPhotoScreen, PinConfirmation, RouteDashboard, ShiftSummary)
│       │   ├── offline/                   (db.ts [IndexedDB])
│       │   └── state/                     (store.tsx, slices/)
│       └── package.json                   (React 19, Lucide, Tailwind v4, Vite 8)
├── Drive Data/                            (calendar.csv, outlets.csv, vehicles.csv)
├── CSC/                                   (products.demo.csv)
├── docker-compose.yml                     (Multi-container definition for mongo, api, and 5 frontends)
└── docs/                                  (Architecture, plans, and runbooks)
```

### Tech Stack & Runtime Reality

| Application / Service | Tech Stack | Backend Present? | Primary Data Source | Env Variables Used |
|---|---|:---:|---|---|
| **Backend API** | Node.js 24, Fastify 5.6, Mongoose 8.19, TypeScript | Yes (Port 3000) | MongoDB 8.0.14 (`waylink` replicaSet `rs0`) | `PORT`, `MONGODB_URI`, `JWT_SECRET`, `LOGIN_ORIGIN`, `DISPATCHER_ORIGIN`, `LOADER_ORIGIN`, `DRIVER_ORIGIN`, `STORE_MANAGER_ORIGIN`, `CLOUDINARY_*` |
| **Login App** | React 19, Vite 8, Tailwind v4 | Calls API | API `/api/v1/auth/login` (or `mockApi.ts`) | `VITE_API_BASE_URL`, `VITE_USE_MOCK_AUTH`, `VITE_*_ORIGIN` |
| **Store Manager** | React 19, Vite 8, Tailwind v4, Motion | Calls API | Hybrid: API `/api/v1/unified/orders` for orders; static mock constants for catalogue, delivery detail, & receipt | `VITE_API_BASE_URL`, `VITE_LOGIN_ORIGIN`, `VITE_ALLOW_UNAUTHENTICATED_PROTOTYPE` |
| **Dispatcher** | React 19, Vite 8, Tailwind v4 | Calls API | Hybrid: API `/api/v1/unified/orders` & `/reference/*`; local state for vehicle routes; mock for monitoring | `VITE_API_BASE_URL`, `VITE_LOGIN_ORIGIN`, `VITE_SERVICE_DATE`, `VITE_ALLOW_UNAUTHENTICATED_PROTOTYPE` |
| **Loader** | React 19, Vite 8, Tailwind v4 | Calls API | API `/api/v1/load-jobs` (falls back to `data/mock-data.ts` when no active jobs exist) | `VITE_API_BASE_URL`, `VITE_LOGIN_ORIGIN`, `VITE_ALLOW_UNAUTHENTICATED_PROTOTYPE` |
| **Driver** | React 19, Vite 8, Tailwind v4, IndexedDB | Calls API | API `/api/v1/driver/routes/today` (falls back to `data/mock.ts` when no active trips exist) | `VITE_API_BASE_URL`, `VITE_LOGIN_ORIGIN`, `VITE_ALLOW_UNAUTHENTICATED_PROTOTYPE` |

---

## 3. Stage Scorecard Table

* **UI Completeness Formula:** `(DONE + UI-ONLY + 0.5 * PARTIAL) / Total`
* **Functional Completeness Formula:** `(DONE + 0.5 * PARTIAL) / Total`

| Stage | Weight | UI % | Functional % | DONE | UI-ONLY | PARTIAL | MISSING | Total Items | One-Line Verdict |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **S1 Login & Auth** | 8% | **55.00%** | **55.00%** | 5 | 0 | 1 | 4 | 10 | Sign-in and handoff work; forgot-password, OTP, and AuthContext are missing. |
| **S2 Ordering** | 12% | **70.00%** | **60.00%** | 6 | 1 | 0 | 3 | 10 | Order entry, review, and submission persist to MongoDB; 4 PM cutoff is static text without Colombo time logic. |
| **S3 Planning** | 18% | **46.43%** | **39.29%** | 4 | 1 | 3 | 6 | 14 | Queue reads MongoDB and deferral persists; route publishing bypasses backend Trip creation and constraints. |
| **S4 Loading** | 12% | **86.36%** | **86.36%** | 9 | 0 | 1 | 1 | 11 | High fidelity execution with full accounting invariant; mid-load plan-change modal is absent. |
| **S5 Delivery** | 14% | **65.38%** | **65.38%** | 8 | 0 | 1 | 4 | 13 | Core mobile navigation, meter photos, and PIN verify work; PIN mismatches Store Manager, shortfall logging missing. |
| **S6 Receipt** | 12% | **70.00%** | **50.00%** | 5 | 2 | 0 | 3 | 10 | Real order status polling works; goods verification runs on local mock state, and PIN is displayed too early. |
| **S7 Monitoring & Capacity** | 8% | **44.44%** | **11.11%** | 1 | 3 | 0 | 5 | 9 | Monitoring and calendar are static UI mocks; no live GPS mapping, delay prediction, or forecast calculations. |
| **S8 Cross-Role Integration** | 10% | **33.33%** | **33.33%** | 2 | 0 | 0 | 4 | 6 | Store→Dispatcher order submission and deferral work; Dispatcher→Loader→Driver→Receipt chain is broken. |
| **S9 Degradation & Offline** | 3% | **25.00%** | **25.00%** | 1 | 0 | 1 | 4 | 6 | No named degradation screens exist in any app; only Loader top banner and Driver offline queue exist. |
| **S10 Design Consistency** | 3% | **70.00%** | **70.00%** | 2 | 0 | 3 | 0 | 5 | Strong Daylight vs. Midnight theme adherence; minor font and touch-target discrepancies. |
| **WEIGHTED TOTAL** | **100%** | **58.81%** | **51.25%** | **43** | **7** | **9** | **30** | **89** | **Core UI exists; end-to-end integration severed by parallel order models.** |

---

## 4. Per-Stage Detail (S1 to S10)

### S1: Login and Authentication
*(10 items: 5 DONE, 0 UI-ONLY, 1 PARTIAL, 4 MISSING | UI: 55.00%, Functional: 55.00%)*

| Item / Requirement | Status | Evidence (File & Component) | What is Missing | Smallest Fix |
|---|---|---|---|---|
| S1.1 Single unified login without role picker | **DONE** | `frontend/Login/src/pages/auth/LoginPage.tsx` (lines 43-200) | None | Verified |
| S1.2 Role-based redirect via env origins | **DONE** | `backend/src/routes/auth.ts` (lines 44-57), `frontend/Login/src/auth/mockApi.ts` (lines 16-30) | None | Verified |
| S1.3 Consumer app route guard (`AuthBoundary`) | **DONE** | `frontend/Store-Manager/src/auth/AuthBoundary.tsx` (lines 4-14) | None | Verified across Store, Dispatcher, Loader, Driver |
| S1.4 Handoff code exchange (`POST /auth/exchange`) | **DONE** | `backend/src/routes/auth.ts` (lines 60-76) | None | Verified |
| S1.5 Session persistence & Bearer header injection | **DONE** | `frontend/Store-Manager/src/auth/session.ts` (lines 1-7), `frontend/Store-Manager/src/services/client.ts` (lines 4-10) | None | Verified |
| S1.6 Forgot Password screen & endpoint | **MISSING** | `frontend/Login/src/App.tsx` (lines 22-27) | `ForgotPasswordPage.tsx` and `POST /auth/forgot-password` absent | Add `ForgotPasswordPage.tsx` with NIC, email, phone inputs |
| S1.7 OTP verification screen & endpoint | **MISSING** | `frontend/Login/src/App.tsx` (lines 22-27) | `VerifyCodePage.tsx` and `POST /auth/verify-otp` absent | Add `VerifyCodePage.tsx` with 6-digit OTP input boxes |
| S1.8 Resend OTP timer & endpoint | **MISSING** | Not found in `frontend/Login/src/` or `backend/src/routes/auth.ts` | No resend endpoint or 60s cooldown timer | Implement `POST /auth/resend-otp` |
| S1.9 Shared AuthContext & provider wrapper | **MISSING** | `frontend/Login/src/main.tsx` (lines 9-13) | `AuthContext.tsx` not implemented; `<App />` not wrapped in `<AuthProvider>` | Create `AuthContext.tsx` and wrap in `main.tsx` |
| S1.10 Credential format validation | **PARTIAL** | `frontend/Login/src/auth/validation.ts` (lines 1-3) | Has `isEmployeeId` & `isEmail`; missing NIC, phone (+94), and OTP regex | Add regex validators for NIC, phone, and 6-digit OTP |

---

### S2: Ordering (Store Manager)
*(10 items: 6 DONE, 1 UI-ONLY, 0 PARTIAL, 3 MISSING | UI: 70.00%, Functional: 60.00%)*

| Item / Requirement | Status | Evidence (File & Component) | What is Missing | Smallest Fix |
|---|---|---|---|---|
| S2.1 Catalog browsing & category filtering | **DONE** | `frontend/Store-Manager/src/App.tsx` (lines 1819-1865), `frontend/Store-Manager/src/services/store.ts` (lines 16-19) | None | Verified |
| S2.2 Structured quantity controls & summary | **DONE** | `frontend/Store-Manager/src/App.tsx` (lines 1886-2100) | None | Verified |
| S2.3 Review Order step (`ReviewOrderPage`) | **DONE** | `frontend/Store-Manager/src/App.tsx` (lines 2620-2645) | None | Verified |
| S2.4 Order submission persistence to DB | **DONE** | `frontend/Store-Manager/src/services/store.ts` (lines 21-37), `backend/src/routes/unified-orders.ts` (lines 21-42) | None | Verified |
| S2.5 Order confirmation screen (`OrderConfirmationPage`) | **DONE** | `frontend/Store-Manager/src/App.tsx` (lines 2650-2720) | None | Verified |
| S2.6 Submission error recovery & retry | **DONE** | `frontend/Store-Manager/src/App.tsx` (lines 2625-2633) | None | Verified |
| S2.7 4 PM cutoff UI indicator | **UI-ONLY** | `frontend/Store-Manager/src/App.tsx` (lines 229-270, `GlobalCutoff`) | Pure UI mockup; toggleable only via prototype prop | Wire to real remaining time calculation |
| S2.8 Dynamic Asia/Colombo 16:00 calculation | **MISSING** | `frontend/Store-Manager/src/App.tsx` (lines 239-242) | Hard-coded `"2h 14m"`; no real time calculation against 16:00 SLT | Compute difference between `new Date()` in `Asia/Colombo` and 16:00 |
| S2.9 Operating day & Sunday skip enforcement | **MISSING** | `frontend/Store-Manager/src/App.tsx` (lines 2660-2700) | No Sunday skip logic; allows setting Sunday as delivery date | Advance target delivery day past Sunday or non-operating dates |
| S2.10 Outlet constraint visibility (dock, window) | **MISSING** | `frontend/Store-Manager/src/App.tsx` (lines 2640-2750) | Not shown on New Order or Review pages | Render outlet receiving window (`05:30-07:30`) and dock type |

---

### S3: Planning (Dispatcher)
*(14 items: 4 DONE, 1 UI-ONLY, 3 PARTIAL, 6 MISSING | UI: 46.43%, Functional: 39.29%)*

| Item / Requirement | Status | Evidence (File & Component) | What is Missing | Smallest Fix |
|---|---|---|---|---|
| S3.1 Order queue display | **DONE** | `frontend/dispatcher/src/App.tsx` (lines 2691-2722) | None | Verified |
| S3.2 4 PM cutoff bucket separation | **MISSING** | `frontend/dispatcher/src/App.tsx` (lines 237-238) | Shows static text `"Today at 16:00"`; does not partition late orders | Group orders into "Before Cutoff" and "After Cutoff" tabs |
| S3.3 Queue filtering & sorting | **DONE** | `frontend/dispatcher/src/App.tsx` (lines 1230-1340) | None | Verified |
| S3.4 Trip drafting interface | **UI-ONLY** | `frontend/dispatcher/src/App.tsx` (lines 1450-1650), `frontend/dispatcher/src/components/CheckModal.tsx` (lines 20-75) | Operates strictly in React state; does not save draft trips | Persist trip draft to backend |
| S3.5 Weight capacity validation | **PARTIAL** | `frontend/dispatcher/src/App.tsx` (line 1281), `frontend/dispatcher/src/components/CheckModal.tsx` (lines 68-70) | Checked in UI only; never calls backend `validateTrip` | Invoke `planningApi.validateTrip` before publishing |
| S3.6 Volume capacity validation | **PARTIAL** | `frontend/dispatcher/src/App.tsx` (lines 1898-1904) | Checked in suggestion heuristic only; not enforced in CheckModal | Block publishing if `volumeOf(orders) > vehicle.volumeM3` |
| S3.7 Temperature / Reefer compatibility | **MISSING** | `frontend/dispatcher/src/App.tsx` (line 2728) | Allows assigning Fresh Chilled orders to non-reefer vehicles | Enforce `vehicle.type === "Refrigerated"` for Chilled orders |
| S3.8 Route limit (max 2) & fuel quota | **PARTIAL** | `frontend/dispatcher/src/App.tsx` (lines 1251-1255), `frontend/dispatcher/src/components/ManageVehiclesModal.tsx` (lines 43-50) | UI disables card when turns >= 2 or fuel exhausted, but no backend check | Validate against backend vehicle route count |
| S3.9 Outlet access restrictions (`van_only`, mall) | **MISSING** | Not found in `frontend/dispatcher/src/App.tsx` | No checks for `van_only` access or mall bays | Add `accessNote` check restricting non-van assignment |
| S3.10 Delivery window constraint (Fresh < 8 AM) | **MISSING** | Not found in `frontend/dispatcher/src/App.tsx` | Dispatcher UI does not flag stops arriving after 08:00 | Flag Fresh stops with planned arrival > 08:00 |
| S3.11 Deferral modal with reason recording | **DONE** | `frontend/dispatcher/src/components/DeferModal.tsx` (lines 10-70) | None | Verified |
| S3.12 Deferral persistence to DB | **DONE** | `frontend/dispatcher/src/App.tsx` (lines 2850-2875) | None | Verified |
| S3.13 Consecutive skip indicator | **MISSING** | Not found in `frontend/dispatcher/src/components/` | No warning when deferring an already deferred order | Check order's `statusHistory` and display "Skipped previous run" |
| S3.14 Trip publishing to backend Trip model | **MISSING** | `frontend/dispatcher/src/App.tsx` (lines 2793-2804) | Calls `PATCH /unified/orders/:id` instead of `POST /planning/trips` | Call `planningApi.createTrip` and `publishTrip` |

---

### S4: Loading (Loader)
*(11 items: 9 DONE, 0 UI-ONLY, 1 PARTIAL, 1 MISSING | UI: 86.36%, Functional: 86.36%)*

| Item / Requirement | Status | Evidence (File & Component) | What is Missing | Smallest Fix |
|---|---|---|---|---|
| S4.1 Available work discovery | **DONE** | `frontend/loader/src/pages/AvailableWorkPage.tsx` (lines 50-120) | None | Verified |
| S4.2 Load claiming & ownership | **PARTIAL** | `frontend/loader/src/services/loads.ts` (line 13), `frontend/loader/src/App.tsx` (lines 60-75) | API call implemented, but falls back to mock when DB has no trips | Populate real trips from Dispatcher |
| S4.3 Reverse delivery order execution | **DONE** | `frontend/loader/src/pages/ActiveLoadPage.tsx` (lines 90-150) | None | Verified |
| S4.4 Departure countdown timer on load | **DONE** | `frontend/loader/src/components/loader-ui.tsx` (`LoadDepartureTimer`) | None | Verified |
| S4.5 Item accounting (Pending → Loaded) | **DONE** | `frontend/loader/src/pages/ActiveLoadPage.tsx` (lines 100-110) | None | Verified |
| S4.6 Shortfall/damage exception capture | **DONE** | `frontend/loader/src/pages/ActiveLoadPage.tsx` (lines 200-230) | None | Verified |
| S4.7 Reconciliation invariant screen | **DONE** | `frontend/loader/src/pages/ReconciliationPage.tsx` (lines 60-70) | None | Verified |
| S4.8 Confirmation gate (`Pending === 0`) | **DONE** | `frontend/loader/src/pages/ReconciliationPage.tsx` (line 69) | None | Verified |
| S4.9 Load Confirmed screen with variance | **DONE** | `frontend/loader/src/pages/LoadConfirmedPage.tsx` (lines 40-90) | None | Verified |
| S4.10 Separation: Confirmed vs Vehicle Release | **DONE** | `frontend/loader/src/pages/LoadConfirmedPage.tsx` (lines 210-230) | None | Verified |
| S4.11 Mid-load plan-change modal (`OUT019`) | **MISSING** | Not found in `frontend/loader/src/pages/ActiveLoadPage.tsx` | No plan change banner or acknowledgement gate | Add a plan-change modal triggered if a stop is deferred |

---

### S5: Delivery (Driver)
*(13 items: 8 DONE, 0 UI-ONLY, 1 PARTIAL, 4 MISSING | UI: 65.38%, Functional: 65.38%)*

| Item / Requirement | Status | Evidence (File & Component) | What is Missing | Smallest Fix |
|---|---|---|---|---|
| S5.1 Profile & Today's Plan selection | **DONE** | `frontend/delivery-driver/src/components/screens/Login.tsx` (lines 310-450) | None | Verified |
| S5.2 Start meter photo capture | **DONE** | `frontend/delivery-driver/src/components/screens/MeterPhotoScreen.tsx` (lines 220-445) | None | Verified |
| S5.3 Route Dashboard stop sequence | **DONE** | `frontend/delivery-driver/src/components/screens/RouteDashboard.tsx` (lines 101-317) | None | Verified |
| S5.4 Vector map navigation & external Google Maps | **DONE** | `frontend/delivery-driver/src/components/screens/MapNavigation.tsx` (lines 263-270) | None | Verified |
| S5.5 Market Detail unpacking checklist | **DONE** | `frontend/delivery-driver/src/components/screens/MarketDetail.tsx` (lines 90-228) | None | Verified |
| S5.6 Shortfall/damage recording at stop | **MISSING** | `frontend/delivery-driver/src/components/screens/MarketDetail.tsx` (lines 168-212) | Only binary checkboxes exist; cannot flag item shortage | Add shortfall toggle per checklist item |
| S5.7 Arrival timestamp recording button | **MISSING** | `frontend/delivery-driver/src/components/screens/MarketDetail.tsx` (lines 90-228) | No explicit "I've Arrived" button; `arrivedAt` not recorded | Add "I've Arrived" action triggering `driverApi.arriveStop` |
| S5.8 PIN confirmation & lockout protection | **DONE** | `frontend/delivery-driver/src/features/pin-confirmation/components/PinConfirmationScreen.tsx` (lines 50-130) | None | Verified |
| S5.9 PIN code alignment with Store Manager | **MISSING** | `frontend/delivery-driver/src/features/pin-confirmation/hooks/usePinVerification.ts` (line 90) | Driver accepts `4821`; Store Manager shows `4827` | Align Driver PIN to `4827` (or shared delivery PIN) |
| S5.10 End meter photo capture | **PARTIAL** | `frontend/delivery-driver/src/components/screens/RouteDashboard.tsx` (line 80) | `handleFinishRoute` jumps to `shift_summary`, skipping end meter | Route `handleFinishRoute` through `meter_photo_end` |
| S5.11 Shift summary audit view | **DONE** | `frontend/delivery-driver/src/components/screens/ShiftSummary.tsx` (lines 163-270) | None | Verified |
| S5.12 Offline IndexedDB queue | **DONE** | `frontend/delivery-driver/src/offline/db.ts` (lines 1-70), `frontend/delivery-driver/src/state/store.tsx` (lines 158-180) | None | Verified |
| S5.13 Outlet constraints visible on stops | **MISSING** | `frontend/delivery-driver/src/data/mock.ts` (lines 73-89), `frontend/delivery-driver/src/components/screens/RouteDashboard.tsx` (lines 280-310) | No window (<8 AM), dock type, or access restriction chips | Add constraint chips to stop card |

---

### S6: Receipt (Store Manager)
*(10 items: 5 DONE, 2 UI-ONLY, 0 PARTIAL, 3 MISSING | UI: 70.00%, Functional: 50.00%)*

| Item / Requirement | Status | Evidence (File & Component) | What is Missing | Smallest Fix |
|---|---|---|---|---|
| S6.1 Live orders list with polling | **DONE** | `frontend/Store-Manager/src/App.tsx` (lines 4315-4335) | None | Verified |
| S6.2 Order Detail lifecycle timeline | **DONE** | `frontend/Store-Manager/src/App.tsx` (lines 3430-3460) | None | Verified |
| S6.3 Expected arrival ETA window display | **UI-ONLY** | `frontend/Store-Manager/src/App.tsx` (line 3068) | Static mock `"06:40–07:00"`; not derived from Dispatcher plan | Read planned arrival window from backend |
| S6.4 Deferral notification card with reason | **DONE** | `frontend/Store-Manager/src/App.tsx` (lines 3460-3485) | None | Verified |
| S6.5 Deferral recourse actions | **MISSING** | `frontend/Store-Manager/src/App.tsx` (line 3467) | Static text `<small>No action required.</small>`; no action buttons | Add "Request priority" and "Contact dispatch" buttons |
| S6.6 Item-by-item receipt verification | **DONE** | `frontend/Store-Manager/src/App.tsx` (lines 3580-3660) | None | Verified |
| S6.7 Issue chips with business-aware options | **DONE** | `frontend/Store-Manager/src/App.tsx` (lines 3700-3850) | None | Verified |
| S6.8 Delivery PIN card display | **UI-ONLY** | `frontend/Store-Manager/src/App.tsx` (lines 3087-3089) | Static boxes `4 8 2 7`; not linked to Driver verification | Connect to `storeDeliveryApi.issuePin` |
| S6.9 Correct PIN reveal sequencing | **MISSING** | `frontend/Store-Manager/src/App.tsx` (lines 3077-3112) | PIN is revealed at `state === "arrived"` BEFORE goods check | Move PIN reveal to post-receipt confirmation step |
| S6.10 Driver delivery record summary card | **MISSING** | `frontend/Store-Manager/src/App.tsx` (lines 3550-3600) | Manager verifies blind without seeing Driver arrived time or shortfall | Render Driver record summary above receipt checklist |

---

### S7: Monitoring and Capacity Planning (Dispatcher)
*(9 items: 1 DONE, 3 UI-ONLY, 0 PARTIAL, 5 MISSING | UI: 44.44%, Functional: 11.11%)*

| Item / Requirement | Status | Evidence (File & Component) | What is Missing | Smallest Fix |
|---|---|---|---|---|
| S7.1 Live route monitoring view | **UI-ONLY** | `frontend/dispatcher/src/App.tsx` (lines 580-790) | Displays hard-coded sample routes from `sampleData.ts` | Query live trips via `GET /api/v1/monitor/trips` |
| S7.2 Stop-by-stop progress tracking | **UI-ONLY** | `frontend/dispatcher/src/App.tsx` (lines 630-670) | Mock stop dots; does not reflect Driver stop completions | Map live stop statuses from backend `Trip.stops` |
| S7.3 Live Driver GPS & location plotting | **MISSING** | Not found in `frontend/dispatcher/src/` | Backend has `location-batch`, but Dispatcher has no map plot | Poll `/trips/:tripId` and render pin on route map |
| S7.4 Driver offline / stale-data indicator | **MISSING** | `frontend/dispatcher/src/App.tsx` (lines 610-630) | No indicator when driver last location is older than 5 minutes | Show "Stale GPS (12m ago)" badge on route card |
| S7.5 Predictive delay / lateness warning | **MISSING** | Not found in `frontend/dispatcher/src/` | Does not compute ETA delta against planned arrival | Compare current time + remaining stops against ETA |
| S7.6 Capacity planning calendar picker | **UI-ONLY** | `frontend/dispatcher/src/components/CalendarModal.tsx` (lines 20-100) | Visual day selector only; no capacity projections | Link selected day to required vehicle calculations |
| S7.7 Calendar demand factors (paydays, festivals, monsoon) | **MISSING** | `frontend/dispatcher/src/components/CalendarModal.tsx` (lines 75-105) | Does not render paydays, festival ramps, or monsoon flags | Fetch `/calendar/:date` and display event tags |
| S7.8 Resource requirement forecasting | **MISSING** | Not found in `frontend/dispatcher/src/` | No calculation of needed reefer trucks, vans, or drivers | Multiply demand by standard vehicle capacity |
| S7.9 Vehicle quota & turn limits modal | **DONE** | `frontend/dispatcher/src/components/ManageVehiclesModal.tsx` (lines 18-60) | None | Verified |

---

### S8: Cross-Role Integration
*(6 items: 2 DONE, 0 UI-ONLY, 0 PARTIAL, 4 MISSING | UI: 33.33%, Functional: 33.33%)*

| Hop / Direction | Status | Evidence (File & Component) | Where it Breaks | Fix |
|---|---|---|---|---|
| S8.1 Store Manager → Dispatcher (Order) | **DONE** | `frontend/Store-Manager/src/services/store.ts` (lines 21-37), `frontend/dispatcher/src/App.tsx` (line 2691) | None (Flows through `POST /api/v1/unified/orders`) | Keep; replace hardcoded `"store-1"` with actual outlet ID |
| S8.2 Dispatcher → Store Manager (Deferral) | **DONE** | `frontend/dispatcher/src/App.tsx` (lines 2850-2875), `frontend/Store-Manager/src/App.tsx` (lines 4315-4335) | None (Flows through `PATCH /api/v1/unified/orders/:id`) | Keep |
| S8.3 Dispatcher → Loader (Publish Trip) | **MISSING** | `frontend/dispatcher/src/App.tsx` (lines 2793-2804) | `publishSchedule` patches unified order, never calls `POST /planning/trips` | Call `planningApi.createTrip` and create `LoadRecord` |
| S8.4 Loader → Driver (Load Confirmed) | **MISSING** | `frontend/loader/src/services/loads.ts` (line 19), `frontend/delivery-driver/src/state/store.tsx` (line 121) | Because Dispatcher didn't create a Trip, Driver finds no active trips | Create Trip in MongoDB so Driver can load today's assignments |
| S8.5 Driver → Store Manager (Receipt) | **MISSING** | `frontend/delivery-driver/src/components/screens/MarketDetail.tsx`, `frontend/Store-Manager/src/App.tsx` (line 4436) | Driver does not write `DeliveryRecord.items`; Store Manager uses mock data | Read `DeliveryRecord` from backend in Store Manager receipt |
| S8.6 Store Manager → Driver (PIN Handoff) | **MISSING** | Store: `4827` (`frontend/Store-Manager/src/App.tsx:3087`); Driver: `4821` (`frontend/delivery-driver/src/features/pin-confirmation/hooks/usePinVerification.ts:90`) | PIN code mismatch and static local verification in Driver | Synchronize PIN to `4827` or use backend PIN verification |

---

### S9: Degradation and Offline States
*(6 items: 1 DONE, 0 UI-ONLY, 1 PARTIAL, 4 MISSING | UI: 25.00%, Functional: 25.00%)*

| Item / Requirement | Status | Evidence (File & Component) | What is Missing | Smallest Fix |
|---|---|---|---|---|
| S9.1 Named Driver degradation screen ("Dead Zone Drop") | **MISSING** | `DRIVER_AUDIT.md` (lines 71-83) | No dedicated component; only passive `SignalIndicator.tsx` chip | Create `DeadZoneDegradation.tsx` screen |
| S9.2 Driver offline queuing & reconnect sync | **PARTIAL** | `frontend/delivery-driver/src/offline/db.ts` (lines 1-70), `frontend/delivery-driver/src/components/SyncStatus.tsx` | Queues GPS locations and marks pending, but lacks conflict handling | Add conflict resolution modal if stop was altered while offline |
| S9.3 Named Store degradation screen ("Missed the Cutoff") | **MISSING** | `storemanager.md` (lines 669-720) | Only inline `SubmissionError` banner exists | Create dedicated "Missed the Cutoff" modal dialog |
| S9.4 Store Manager offline order/receipt queuing | **MISSING** | `frontend/Store-Manager/src/App.tsx` (line 2630) | Fails immediately on network error; no device queue | Cache pending orders in `localStorage` when `!navigator.onLine` |
| S9.5 Named Dispatcher degradation screen ("Capacity Exceeded") | **MISSING** | Not found in `frontend/dispatcher/src/` | No degradation view when demand exceeds fleet limits | Add "Capacity Exceeded" overlay showing ranked deferral list |
| S9.6 Loader offline banner & sync status | **DONE** | `frontend/loader/src/hooks/useConnectivity.ts` (lines 1-30), `frontend/loader/src/components/loader-ui.tsx` (`LoaderShell`) | None | Verified |

---

### S10: Design Consistency and Documentation
*(5 items: 2 DONE, 0 UI-ONLY, 3 PARTIAL, 0 MISSING | UI: 70.00%, Functional: 70.00%)*

| Item / Requirement | Status | Evidence (File & Component) | What is Missing | Smallest Fix |
|---|---|---|---|---|
| S10.1 Daylight vs Midnight theme allocation | **DONE** | Store (`daylight`), Dispatcher (`daylight`), Loader (`high contrast dark`), Driver (`midnight`) | None | Verified across CSS files |
| S10.2 Typography adherence (Inter + Poppins) | **PARTIAL** | `frontend/delivery-driver/src/styles/tokens.css` (line 7) | Driver app uses system SF Pro Display instead of Inter/Poppins | Import Inter and Poppins in Driver `tokens.css` |
| S10.3 Minimum 48px touch targets | **PARTIAL** | `frontend/delivery-driver/src/components/screens/RouteDashboard.tsx` (line 115) | Several sub-44px targets in Driver (`Call` link 32px, `Map ›` link 32px) | Add `min-h-[48px] min-w-[48px]` to action links |
| S10.4 Screen rationale documented | **DONE** | `DRIVER_AUDIT.md`, `storemanager.md`, `loader-document.md` | None | Verified |
| S10.5 Shared WayLink branding | **PARTIAL** | `frontend/delivery-driver/src/components/shared/TopBar.tsx` (line 13) | TopBar titled `"Fleet Logistics"` or `"WayTrack"` instead of `"WayLink"` | Change title prop to `"WayLink"` |

---

## 5. Cross-Role Chain Table

| Hop | Data That Should Pass | Current Status | Where It Breaks (File & Line) | Root Cause & Smallest Fix |
|---|---|:---:|---|---|
| **Ordering → Planning** | Store ID, outlet name, brand, order type (dry/chilled), item SKUs, quantities, requested date, cutoff bucket | **Working** *(via UnifiedOrder)* | `frontend/Store-Manager/src/services/store.ts` (lines 27-35) | Works via `POST /api/v1/unified/orders`, but `storeId: "store-1"` and `town: "Kandy City"` are hardcoded. Replace with logged-in user's outlet context. |
| **Planning → Loading** | Published Trip ID, vehicle, assigned driver, bay, departure time, reverse stop order, expected item quantities | **Broken** | `frontend/dispatcher/src/App.tsx` (lines 2798-2802) | `publishSchedule` only executes `PATCH /unified/orders/:id` and never calls `POST /api/v1/planning/trips`. Loader's `loadApi.list()` calls `GET /api/v1/load-jobs` which finds 0 `LoadRecord` documents. **Fix:** Have `publishSchedule` call `planningApi.createTrip` and create corresponding `LoadRecord`. |
| **Loading → Delivery** | Confirmed load record, loaded vs missing/damaged exception quantities, confirmation timestamp | **Broken** | `frontend/delivery-driver/src/state/store.tsx` (line 121) | Driver queries `GET /api/v1/driver/routes/today` for `Trip` records. Because Dispatcher never created a `Trip`, Driver receives `[]` and falls back to static mock data. **Fix:** Creating trips in Planning resolves this automatically. |
| **Delivery → Receipt** | Driver arrival time, delivered items, shortage reasons, delivery PIN | **Broken** | `frontend/Store-Manager/src/App.tsx` (line 4436), `frontend/delivery-driver/src/components/screens/MarketDetail.tsx` | Store Manager's `ReceiptFlowPage` reads static mock constants (`ORD-1082`, `WP-014`) and never reads `DeliveryRecord` from backend. **Fix:** Pass live delivery ID to `ReceiptFlowPage` and render driver delivered items. |
| **Deferral → Store Manager** | Deferred status, plain language reason, rescheduled delivery date | **Working** | `frontend/dispatcher/src/App.tsx` (lines 2860-2870) | Dispatcher PATCHes `/unified/orders/:id` with `{ status: "Deferred", deferredTo, deferredNotice }`; Store Manager polls every 5s and updates status pill. |
| **Store Manager → Driver (PIN)** | 4-digit verification PIN handed off in person | **Broken** | Store: `frontend/Store-Manager/src/App.tsx` (line 3087) (`4827`)<br>Driver: `frontend/delivery-driver/src/features/pin-confirmation/hooks/usePinVerification.ts` (line 90) (`4821`) | Code mismatch. Driver rejects Store Manager's PIN. Furthermore, Store reveals PIN at arrival before goods check. **Fix:** Change Driver accepted PIN to `4827` and reveal it only after goods verification is complete. |

---

## 6. Document-vs-Code Mismatches

1. **Loader Plan-Change Acknowledgment (`OUT019`):**
   * *Claim in `loader-document.md` Section 5.3:* "OUT019 — Deferred — Reefer shortage ... The Loader receives a visible plan-change indication identifying the affected order ... The Loader explicitly acknowledges the plan change before continuing."
   * *Code Reality:* Neither string `"OUT019"` nor any plan-change modal component exists anywhere in `frontend/loader/src/`.
2. **PIN Code Value Mismatch:**
   * *Claim in `DRIVER_AUDIT.md` R3 & Section 6:* Driver accepts PIN `'4821'`.
   * *Claim in `storemanager.md` Section 7:* Store Manager displays delivery PIN `'4 8 2 7'`.
   * *Code Reality:* The two applications are hardcoded to different numbers. Driver verifies strictly against `'4821'`, while Store Manager renders `'4 8 2 7'`.
3. **Driver Arrival Recording:**
   * *Claim in `DRIVER_AUDIT.md` R9:* "Record arrival at each outlet".
   * *Code Reality:* Marked as a Gap in `DRIVER_AUDIT.md` and still missing in `frontend/delivery-driver/src/components/screens/MarketDetail.tsx`. No arrival action button exists on the screen.
4. **Driver Meter Photo End Capture:**
   * *Claim in `DRIVER_AUDIT.md` R19:* "Start & end vehicle meter photo on every route".
   * *Code Reality:* `RouteDashboard.tsx:80` calls `replaceScreen('shift_summary')`, directly bypassing `meter_photo_end`.
5. **Named Degradation Screens:**
   * *Claims across all 4 documents:* System specifies named degradation screens ("Dead Zone Drop" for Driver, "Missed the Cutoff" / "Deferred Again" for Store Manager, "Capacity Exceeded" for Dispatcher).
   * *Code Reality:* Zero named degradation screens exist in the codebase. All apps only have inline error banners or connectivity pills.
6. **Sri Lanka Colombo Cutoff Time:**
   * *Claim in `storemanager.md` SM-05:* "Show 4 PM next-day cutoff".
   * *Code Reality:* Cutoff displays are hard-coded text strings (`"2h 14m remaining"`, `"Today at 16:00"`). There is no real-time Luxon/Date calculation in `Asia/Colombo`.
7. **Southern Province vs. Western/Central Province Data:**
   * *Claim in `WayLink_Dispatcher_Audit_Prompt.md` Section M:* Shared dataset is `outlets.csv` (Kandy, Colombo, Peliyagoda).
   * *Code Reality:* `sampleData.ts` and `unifiedOrders.ts` seed Southern Province towns (`Galle`, `Matara`, `Weligama`, `Unawatuna`).

---

## 7. Plan vs. Reality for the Login Plan

Audit of `docs/WayTrack_Login_Implementation_Plan.md`:

| Planned Item | Specification | Code Status | Exact Evidence |
|---|---|:---:|---|
| **One login for all roles** | Single `/login` route, no role selector dropdown | **Present** | `frontend/Login/src/pages/auth/LoginPage.tsx` (lines 43-201) |
| **Backend role routing** | Backend decides role and returns `redirectUrl` / `redirectTo` | **Present** | `backend/src/routes/auth.ts` (lines 44-57), `frontend/Login/src/auth/mockApi.ts` (lines 28-29) |
| **Fallback role map** | `src/auth/roles.ts` mapping roles to home routes | **Present** | `frontend/Login/src/auth/roles.ts` (lines 3-8) (`ROLE_HOME`) |
| **File: `AuthLayout.tsx`** | Blue logo panel (left) + form slot (right) | **Present** | `frontend/Login/src/pages/auth/AuthLayout.tsx` |
| **File: `LoginPage.tsx`** | Screen 1: Employee ID + Password + Email | **Present** | `frontend/Login/src/pages/auth/LoginPage.tsx` |
| **File: `ForgotPasswordPage.tsx`** | Screen 2: NIC + Email + Phone | **Missing** | Not found in `frontend/Login/src/pages/auth/` |
| **File: `VerifyCodePage.tsx`** | Screen 3: 6-digit OTP entry | **Missing** | Not found in `frontend/Login/src/pages/auth/` |
| **File: `AuthContext.tsx`** | React Context managing `user`, `token`, `login`, `logout` | **Missing** | Not found in `frontend/Login/src/auth/` |
| **App.tsx wrap in `<AuthProvider>`** | `main.tsx` wrapping `<App />` in `<AuthProvider>` | **Missing** | `frontend/Login/src/main.tsx` (lines 9-13) mounts `<App />` directly |
| **Route Guard / `canAccess`** | Route guard validating permissions on navigation | **Partial** | `roles.ts` defines `canAccess`, but `App.tsx` has no route protection |
| **Endpoint: `POST /api/auth/login`** | Returns `{ token, user, redirectTo }` | **Partial** | Implemented as `/api/v1/auth/login` returning `{ handoffCode, redirectUrl }` |
| **Endpoint: `POST /api/auth/forgot-password`** | Initiates password reset with masked contacts | **Missing** | Not found in `backend/src/routes/auth.ts` |
| **Endpoint: `POST /api/auth/verify-otp`** | Validates OTP and returns auth session | **Missing** | Not found in `backend/src/routes/auth.ts` |
| **Endpoint: `POST /api/auth/resend-otp`** | Resends OTP code | **Missing** | Not found in `backend/src/routes/auth.ts` |
| **Endpoint: `POST /api/auth/logout`** | Token revocation | **Present** | `backend/src/routes/auth.ts` (lines 95-98) |

---

## 8. Risks

1. **Independent Origin Domain Isolation (Vercel / Production Deployments):**
   * *Risk:* The 5 frontends run on separate origins (ports 5173, 5174, 5175, 5176, 5177 in dev; 5 different domains in Vercel). They **cannot** share `localStorage`, `sessionStorage`, or in-memory state.
   * *Mitigation:* The existing `AuthHandoff` ticket exchange via backend query param (`?code=...`) is the correct architectural pattern and must not be replaced with local storage sharing.
2. **UI & Token Inviolability:**
   * *Risk:* Naively replacing frontend mock data with backend API data can break layout styling, component prop types, and animations (e.g. `motion/react` spring transitions in Store Manager).
   * *Mitigation:* Preserve all component interfaces and design tokens. Data fetching adapters must map backend models into the exact shapes expected by existing UI components.
3. **Database Schema Collision (Dual Order Pipeline):**
   * *Risk:* Attempting to merge `UnifiedOrder` and official `Order` models simultaneously might invalidate existing seed scripts or break active demo endpoints.
   * *Mitigation:* Bridge `UnifiedOrder` into `Trip` generation inside `POST /api/v1/planning/trips` without altering the `UnifiedOrder` schema.
4. **Driver Offline Data Wipe on Session Reset:**
   * *Risk:* In `ShiftSummary.tsx:146`, ending a shift triggers `resetDemo()`, clearing device memory. Unsynced stops queued in IndexedDB could be permanently lost if a driver clicks "Confirm End".
   * *Mitigation:* Block `resetDemo()` if `listPendingLocations()` or unsynced outlet stops exist in IndexedDB.

---

## 9. Prioritized Roadmap (Top 15 Actions)

| # | Action | Stage | Files Involved | Est. Time | Proj. Func % | Rationale |
|:---:|---|:---:|---|:---:|:---:|---|
| **1** | **Bridge Dispatcher Route Publish to Backend `Trip`** | S3, S8 | `frontend/dispatcher/src/App.tsx`, `backend/src/routes/planning.ts` | 2.0 h | **55.10%** | **Core blocker.** Calling `createTrip` generates `LoadRecord` and makes trips visible to Loader and Driver. |
| **2** | **Synchronize PIN Value (Driver & Store Manager)** | S5, S8 | `frontend/delivery-driver/src/features/pin-confirmation/hooks/usePinVerification.ts`, `frontend/Store-Manager/src/App.tsx` | 0.5 h | **57.45%** | Eliminates immediate demo failure where Driver rejects Store Manager's PIN. |
| **3** | **Correct Store Manager PIN Reveal Sequencing** | S6 | `frontend/Store-Manager/src/App.tsx` | 1.0 h | **58.65%** | Moves PIN display from "Arrived" hero to post-goods-check verification. |
| **4** | **Reeve Store Manager Dynamic Cutoff (Asia/Colombo 16:00)** | S2 | `frontend/Store-Manager/src/App.tsx` | 1.0 h | **59.85%** | Replaces static `"2h 14m"` text with real-time Colombo calculation. |
| **5** | **Add Dispatcher Reefer Constraint Validation** | S3 | `frontend/dispatcher/src/App.tsx` | 1.0 h | **61.14%** | Blocks assigning chilled orders to non-refrigerated vehicles. |
| **6** | **Implement Driver Arrival Action Button** | S5 | `frontend/delivery-driver/src/components/screens/MarketDetail.tsx` | 1.0 h | **62.22%** | Adds `"I've Arrived"` action stamping `arrivedAt` timestamp. |
| **7** | **Implement Driver Item Shortfall/Damage Flagging** | S5 | `frontend/delivery-driver/src/components/screens/MarketDetail.tsx` | 1.5 h | **63.30%** | Allows drivers to mark missing/damaged crates instead of binary check. |
| **8** | **Wire Route Finish to End Meter Photo** | S5 | `frontend/delivery-driver/src/components/screens/RouteDashboard.tsx` | 0.5 h | **63.84%** | Directs completion flow through `meter_photo_end` before summary. |
| **9** | **Add Store Manager Deferral Recourse Buttons** | S6 | `frontend/Store-Manager/src/App.tsx` | 0.5 h | **64.44%** | Replaces `"No action required"` with `"Request priority"` & `"Contact dispatch"`. |
| **10** | **Add Driver Record Summary Card to Store Receipt** | S6 | `frontend/Store-Manager/src/App.tsx` | 1.5 h | **65.64%** | Shows Driver arrived time and reported shortfalls above receipt checklist. |
| **11** | **Build Named Driver Degradation Screen ("Dead Zone Drop")** | S9 | `frontend/delivery-driver/src/components/screens/DeadZoneDegradation.tsx` | 2.0 h | **66.14%** | Fulfills judging requirement R12 with dedicated offline/conflict screen. |
| **12** | **Implement Forgot Password & OTP in Login App** | S1 | `frontend/Login/src/pages/auth/`, `backend/src/routes/auth.ts` | 2.5 h | **67.74%** | Completes Login plan specifications (NIC, email, phone, OTP verification). |
| **13** | **Enforce Sunday / Operating Day Skip in Store Ordering** | S2 | `frontend/Store-Manager/src/App.tsx` | 1.0 h | **68.94%** | Prevents placing orders for non-operating days. |
| **14** | **Add Consecutive Skip Indicator in Dispatcher Deferral** | S3 | `frontend/dispatcher/src/components/DeferModal.tsx` | 1.0 h | **70.23%** | Warns dispatcher if outlet was skipped on the previous run. |
| **15** | **Connect Dispatcher Route Monitoring to Live Trips** | S7 | `frontend/dispatcher/src/App.tsx` | 2.0 h | **71.12%** | Replaces static monitoring cards with live `GET /api/v1/monitor/trips`. |

---

## 10. Projected Completion

* **Baseline Functional Completeness:** **51.25%**
* **Projected Functional Completeness After Top 5 Actions:** **61.14%** *(+9.89%)*
  * *Impact:* Store → Dispatcher → Loader → Driver cross-role chain unblocked; PIN handoff operational.
* **Projected Functional Completeness After Top 10 Actions:** **65.64%** *(+14.39%)*
  * *Impact:* On-road delivery execution complete; driver shortfall recording and store manager receipt context connected.
* **Projected Functional Completeness After All 15 Actions:** **71.12%** *(+19.87%)*
  * *Impact:* Full end-to-end integration verified; degradation screens, auth OTP, and operational constraints enforced.
