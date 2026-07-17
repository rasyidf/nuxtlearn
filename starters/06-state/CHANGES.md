# Changes from 05-server-routes

## Added

### State Management with `useState`
- `composables/useCart.ts` — shared cart state using Nuxt's `useState` composable
  - SSR-safe reactive state shared across components
  - Cart items, computed total, computed count
  - `addItem`, `removeItem`, `clear` actions

### Pinia Store
- `stores/counter.ts` — Pinia setup store using composition API syntax
  - `count` state, `doubled` getter, `increment`/`decrement`/`reset` actions
  - Auto-imported by `@pinia/nuxt` module (no manual registration needed)

### Pages
- `pages/index.vue` — demonstrates Pinia counter with buttons + cart count display
- `pages/products.vue` — product listing with "Add to Cart" using `useCart()`
- `pages/cart.vue` — cart view with item list, totals, remove, and clear actions

### Layout
- `layouts/default.vue` — header nav with reactive cart badge count

### Configuration
- Added `@pinia/nuxt` module to `nuxt.config.ts`
- Added `pinia` and `@pinia/nuxt` dependencies to `package.json`

## Key Concepts Demonstrated

1. **`useState`** — SSR-safe shared state (hydrates from server to client)
2. **Pinia (setup stores)** — composition-API style stores with `defineStore`
3. **Auto-imports** — `defineStore`, `ref`, `computed`, `useState` all work without imports
4. **Reactive across components** — cart state updates in header when modified in product page
5. **Hydration safety** — `useState` key ensures state identity across SSR boundary

## Removed

- Server API routes from chapter 05 (not needed for this chapter's focus)
