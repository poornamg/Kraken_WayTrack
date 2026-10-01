# WayLink Backend Refactoring Report

## Phase 1: Audit

### Large Files (> 200 lines)
- `backend/src/models/index.ts` (356 lines)
- `backend/src/routes/planning.ts` (340 lines)
- `backend/src/routes/driver.ts` (235 lines)

### Route File Analysis (Mixing of Concerns)
Most route files (e.g., `planning.ts`, `driver.ts`, `loading.ts`, `auth.ts`) currently mix:
1. **Validation**: Inline Zod schemas for request body/query parsing.
2. **Auth Checks**: Inline role checks (`requireRole(request, "dispatcher")`).
3. **DB Queries**: Direct Mongoose calls (`Trip.findOne`, `Model.aggregate`).
4. **Business Logic**: E.g., computing load status, checking idempotency, allocating load stops.
5. **Response Mapping**: Transforming MongoDB documents into API responses.

### Code Smells & Issues
- **Business Logic in Handlers**: Endpoints like `POST /planning/unified-trips` and `POST /driver/assignments/:tripId/claim` embed complex state machines directly in the Fastify handler.
- **Duplicated Logic**: Queries checking trip status (`status: { $ne: "cancelled" }`) are repeated. Auth role extraction is done manually per handler.
- **Inline Schemas**: Zod schemas are defined locally inside the route files without being shared.
- **Magic Strings**: Statuses (`"planned"`, `"completed"`, `"cancelled"`), roles (`"dispatcher"`, `"loader"`), and error codes (`"INVALID_STATE"`) are hardcoded.
- **Monolithic Models**: `models/index.ts` contains all Mongoose schemas and exports them in a single massive file.

### Refactoring Plan (Old -> New)
1. **common/**
   - `middleware/errors.ts` -> `common/errors/index.ts`
   - `middleware/auth.ts` -> `common/middleware/auth.ts`
   - `utils/crypto.ts`, `utils/audit.ts`, `utils/time.ts` -> `common/utils/`
   - `types/` -> `common/types/`
   - (New) `common/constants/` to replace magic strings.
2. **config/**
   - Remains, but consolidate DB and env logic cleanly.
3. **models/**
   - Split `models/index.ts` into `User.ts`, `Trip.ts`, `Order.ts`, `Outlet.ts`, etc., with a re-exporting `index.ts`.
4. **modules/ (Domain Separation)**
   - `routes/auth.ts` -> `modules/auth/` (routes, controller, service, schemas)
   - `routes/planning.ts` -> `modules/planning/`
   - `routes/driver.ts` -> `modules/driver/`
   - `routes/loading.ts` -> `modules/loading/`
   - `routes/orders.ts` -> `modules/orders/`
   - `routes/unified-orders.ts` -> `modules/unified-orders/`
   - `routes/operations.ts` -> `modules/operations/`
   - `routes/reference.ts` -> `modules/reference/`
   - `routes/files.ts` -> `modules/files/`
5. **app.ts / server.ts**
   - Slim down `app.ts` to only bootstrap Fastify plugins and register domain routes.
