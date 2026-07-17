# Changes from Previous Chapter

## Chapter 09: Composables

This starter demonstrates Nuxt's composable and utility auto-import system.

### Added

- **composables/useCounter.ts** — Reusable counter logic with `ref`, `computed`, and exposed methods. Demonstrates the basic composable pattern: encapsulate reactive state + logic, return what consumers need.

- **composables/useNotifications.ts** — Shared-state composable using `useState()` for SSR-safe, cross-component notification management. Shows how composables can maintain singleton state across the app.

- **utils/formatDate.ts** — Pure formatting utility auto-imported from `utils/`. Demonstrates that `utils/` exports are auto-imported just like composables.

- **utils/formatCurrency.ts** — Currency formatting utility using `Intl.NumberFormat`.

- **components/NotificationToast.vue** — Renders notifications from `useNotifications()` as fixed-position toasts. Consumes a composable inside a component.

- **server/api/config.get.ts** — Server route using `useRuntimeConfig()` to expose public config. Shows that composables/utilities exist on both client and server.

- **pages/index.vue** — Demo page exercising all composables, utils, `useAppConfig()`, and `useRuntimeConfig()`.

- **pages/about.vue** — Second page proving `useNotifications()` state is shared across routes (since `useState` is global).

### Key Concepts

1. **Auto-imports** — Files in `composables/` and `utils/` are auto-imported. No explicit import statements needed in components.

2. **Composables vs Utils** — Composables use Vue reactivity (`ref`, `computed`, `useState`). Utils are pure functions with no reactive dependencies.

3. **Shared state** — `useState()` inside a composable creates app-wide singleton state that survives navigation and is SSR-hydration safe.

4. **Naming convention** — Composables use `use` prefix (e.g., `useCounter`). Utils are plain named exports (e.g., `formatDate`).

5. **Runtime vs App config** — `useRuntimeConfig()` for env-driven values (can override at deploy time). `useAppConfig()` for build-time app settings defined in `app.config.ts`.
