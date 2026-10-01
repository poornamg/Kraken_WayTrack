# Login App Refactor Report

## Old -> New File Map
- `src/pages/auth/LoginPage.tsx` (inline icons) -> `src/components/ui/Icons.tsx`
- `src/pages/auth/LoginPage.tsx` (inline Error banner) -> `src/components/ui/ErrorBanner.tsx`
- `src/pages/auth/LoginPage.tsx` (inline Password field) -> `src/components/ui/PasswordField.tsx`
- `src/pages/auth/LoginPage.tsx` (inline Prototype users box) -> `src/components/ui/PrototypeUsersBox.tsx`
- `src/pages/auth/LoginPage.tsx` (state and form logic) -> `src/hooks/useAuthForm.ts`
- `src/auth/mockApi.ts` (PROTOTYPE_USERS) -> `src/data/mockUsers.ts`

## Final Folder Tree
```
src/
├── App.tsx
├── auth/
│   ├── api.ts
│   ├── index.ts
│   ├── mockApi.ts
│   ├── roles.ts
│   ├── types.ts
│   └── validation.ts
├── components/
│   └── ui/
│       ├── ErrorBanner.tsx
│       ├── Icons.tsx
│       ├── PasswordField.tsx
│       └── PrototypeUsersBox.tsx
├── data/
│   └── mockUsers.ts
├── hooks/
│   └── useAuthForm.ts
├── pages/
│   └── auth/
│       ├── AuthLayout.tsx
│       └── LoginPage.tsx
...
```

## Before/After Line Counts
- `App.tsx`: 28 lines -> 28 lines (was already a thin shell).
- `src/pages/auth/LoginPage.tsx`: 248 lines -> 101 lines.
- `src/auth/mockApi.ts`: 31 lines -> 18 lines.

## How this app is organized
- **`App.tsx`**: Thin shell handling routing via `window.location.pathname` and rendering the correct page component.
- **`auth/`**: Core API fetching logic, mock fallback implementation, auth-related types and role configurations.
- **`components/ui/`**: Extracted granular generic UI elements (Error banners, inputs, and SVG icons).
- **`data/`**: Centralized seed information for mock authentication.
- **`hooks/`**: Extracted form submission handling and state (`useAuthForm`).
- **`pages/`**: Higher-level container compositions representing entire screens (`LoginPage`, `AuthLayout`).

## Exceptions & Notes
- `ForgotPasswordPage` and `VerifyCodePage` were explicitly mentioned in the target structure examples, but after an audit, they did not exist in the source codebase. They were intentionally **not created**, in adherence to the "ZERO BEHAVIOR CHANGES" and "No feature tasks" rules.
- The `auth.css`/`styles` were already refactored previously into the global structure and required no changes.
