# Chapter 10: Error Handling

## What's New

This starter demonstrates Nuxt's layered error handling system — from full-page fatal errors down to component-level boundaries.

## Key Concepts

### `error.vue` — Full-Page Error Handler

- Lives at the project root (sibling to `app.vue`)
- Receives an `error` prop with `statusCode` and `statusMessage`
- Renders when a **fatal** error occurs (replaces the entire app)
- Use `clearError({ redirect: '/' })` to dismiss and navigate away
- Differentiates between 404, 403, 500 with conditional UI

### `NuxtErrorBoundary` — Component-Level Error Catching

- Wraps components that might throw during setup or rendering
- Provides an `#error` scoped slot with the caught error
- Does **not** replace the full page — only the boundary content
- Re-render by changing a `:key` on the boundary (forces remount)
- Used on the home page to wrap `FlakyWidget`

### `createError` — Server-Side Errors

- Used in `server/api/` route handlers to throw HTTP errors
- Accepts `statusCode` and `statusMessage`
- On the client, these surface as fetch errors in `useFetch`
- The `[id].vue` page handles 404 inline rather than triggering `error.vue`

### `showError` / `clearError` — Client-Side Error Control

- `showError({ statusCode, statusMessage })` — programmatically triggers the full-page error state
- `clearError({ redirect })` — clears the error and optionally navigates
- The "Dangerous" page demonstrates manual error triggering

## Files Added

```
error.vue                        → Global error page (404/403/500)
layouts/default.vue              → Navigation header
components/FlakyWidget.vue       → Randomly-crashing component
pages/index.vue                  → NuxtErrorBoundary demo
pages/posts/index.vue            → Post listing
pages/posts/[id].vue             → Post detail with inline error handling
pages/dangerous.vue              → showError() demo
server/api/posts/index.get.ts    → Returns post list
server/api/posts/[id].get.ts     → Returns post or throws 404
```

## Error Handling Decision Tree

```
Error occurs
├── In a server route? → createError() → surfaces via useFetch error
├── In a component wrapped by NuxtErrorBoundary? → caught in #error slot
├── Anywhere else (unhandled)? → triggers error.vue (fatal)
└── Manual trigger? → showError() → triggers error.vue (fatal)
```

## Try It

```bash
npm install
npm run dev
```

- Visit `/` — see the FlakyWidget (retry if it crashes)
- Visit `/posts/99` — see inline 404 handling
- Visit `/dangerous` — click to trigger full-page error
- Full-page error shows `error.vue` with "Go Home" to recover
