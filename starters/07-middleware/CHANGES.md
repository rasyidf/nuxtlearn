# Changes from Previous Starter

## Chapter 07: Middleware & Auth

### Added

- **`composables/useAuth.ts`** — Fake auth composable using `useCookie` for token persistence and `useState` for user data. Provides `login()`, `logout()`, `isAuthenticated`, `user`, and `token`.

- **`middleware/auth.ts`** — Named route middleware that redirects unauthenticated users to `/login`, preserving the original destination in `?redirect=`.

- **`middleware/guest.ts`** — Named route middleware that redirects authenticated users away from guest-only pages (e.g., login) to `/dashboard`.

- **`middleware/admin.ts`** — Named route middleware that aborts navigation with a 403 error if the user's role is not `'admin'`. Must be used after `auth` middleware.

- **`middleware/00.log.global.ts`** — Global middleware (runs on every navigation) that logs route transitions to the console. The `00.` prefix ensures it runs first.

- **`layouts/default.vue`** — App shell with navigation links, auth state display (user name or "Guest"), and logout button.

- **`pages/index.vue`** — Public home page with navigation links to login, dashboard, and admin.

- **`pages/login.vue`** — Login form with `guest` middleware. Accepts a name (use `admin` for admin role). Redirects to `?redirect` query or `/dashboard` after login.

- **`pages/dashboard.vue`** — Protected page with `auth` middleware. Displays current user info.

- **`pages/admin.vue`** — Protected page with `['auth', 'admin']` middleware stack. Only accessible to users with `role: 'admin'`.

### Key Concepts Demonstrated

1. **Named middleware** — Defined in `middleware/` and referenced by filename in `definePageMeta({ middleware: 'name' })`
2. **Global middleware** — Uses `.global.ts` suffix, runs on every route change
3. **Middleware ordering** — Global middleware runs first (alphabetical by filename), then named middleware in array order
4. **Middleware composition** — Combining multiple named middleware: `middleware: ['auth', 'admin']`
5. **Navigation guards** — `navigateTo()` for redirects, `abortNavigation()` with `createError()` for blocking
6. **Redirect preservation** — Storing intended destination in query params for post-login redirect
7. **Cookie-based auth** — `useCookie()` for SSR-compatible token storage
8. **Shared state** — `useState()` for SSR-hydrated reactive state across components
