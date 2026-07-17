---
title: "State Management"
layout: chapter
nav_order: 7
parent: Home
starter: "06-state"
official_docs:
  - https://nuxt.com/docs/4.x/getting-started/state-management
  - https://nuxt.com/docs/4.x/api/composables/use-state
---

# State Management

## TL;DR

`useState` is Nuxt's SSR-safe reactive state primitive — it serializes to the payload and survives hydration without duplication. For complex state with actions and getters, use Pinia (with `@pinia/nuxt`). Never use a plain `ref()` at module scope for shared state — it leaks between requests on the server.

## Mental Model

The core problem: **SSR means multiple users share the same server process.** A module-level `ref()` is a singleton on the server. If User A sets it to "Alice" and User B's request reads it before a fresh instance is created, User B sees "Alice". This is a **cross-request state leak** — a security and correctness bug.

`useState` solves this by:
1. Keying state per-request on the server (isolated)
2. Serializing state into the HTML payload
3. Rehydrating it on the client (no flash, no mismatch)

On the client, module singletons are fine — there's only one user. But because your code runs on both server and client (universal rendering), you need `useState` for any shared reactive state.

### useState

```vue
<script setup lang="ts">
// Key must be unique across the entire app
const counter = useState<number>('counter', () => 0)

// The initializer runs ONLY on first access (not every component that uses it)
const user = useState<User | null>('current-user', () => null)
</script>

<template>
  <button @click="counter++">Count: {{ counter }}</button>
</template>
```

Signature: `useState<T>(key: string, init?: () => T): Ref<T>`

- **`key`** — unique string identifier. Used for payload serialization and deduplication. Same key across components = same state (shared).
- **`init`** — factory function that returns the initial value. Runs only on first access. Must return a serializable value.
- **Returns** — a `Ref<T>` that's reactive and shared across all components using the same key.

**What happens under the hood:**

```
Server:
  1. First component calls useState('counter', () => 0)
  2. State created: { counter: 0 } in request context
  3. Second component calls useState('counter') → gets same ref
  4. HTML renders with final value
  5. Payload includes: { counter: <final value> }

Client:
  1. Hydration reads payload → counter = <value from server>
  2. Components get the hydrated ref (no initializer re-runs)
  3. Subsequent interactions are client-only reactive
```

### Why ref() Alone Fails with SSR

```typescript
// composables/useSharedCounter.ts
// ⚠️ DANGEROUS — DO NOT DO THIS
const count = ref(0)  // Module-level singleton

export function useSharedCounter() {
  return { count }
}
```

This works perfectly in SPA mode. But with SSR:

1. Server process starts, `count` is initialized to `0`
2. Request A calls `count.value++` → `count` is now `1`
3. Request B arrives — `count` is STILL `1` (shared memory!)
4. Request B's user sees "1" instead of "0"

This is cross-request state pollution. The fix:

```typescript
// composables/useSharedCounter.ts
// ✓ SAFE — useState isolates per request
export function useSharedCounter() {
  const count = useState<number>('shared-counter', () => 0)
  return { count }
}
```

**Rule of thumb:** If the state is meant to be shared between components (not local to a single component instance), use `useState`. If it's local component state (`const isOpen = ref(false)` inside a component's setup), plain `ref()` is fine — it's scoped to that component instance.

### Pinia Integration

For state that needs actions, getters, and devtools integration, use Pinia:

```bash
npx nuxi module add pinia
```

This installs `@pinia/nuxt` and registers it in your `nuxt.config.ts`. Pinia stores are then auto-imported from `stores/` directory.

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const displayName = computed(() => user.value?.name ?? 'Guest')

  // Actions
  async function login(credentials: LoginCredentials) {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
    user.value = response.user
    token.value = response.token
  }

  function logout() {
    user.value = null
    token.value = null
    navigateTo('/login')
  }

  return { user, token, isAuthenticated, displayName, login, logout }
})
```

Use in components (auto-imported):

```vue
<script setup lang="ts">
const auth = useAuthStore()
</script>

<template>
  <div v-if="auth.isAuthenticated">
    <span>Welcome, {{ auth.displayName }}</span>
    <button @click="auth.logout()">Logout</button>
  </div>
  <NuxtLink v-else to="/login">Sign In</NuxtLink>
</template>
```

**Pinia + SSR:** The `@pinia/nuxt` module handles serialization automatically. Store state is included in the payload and hydrated on the client. You don't need to do anything special.

**Store directory:** Create a `stores/` directory at your project root. Files there are auto-imported. Convention: one store per file, export the `useXStore` composable.

### Setup vs Options Syntax

Pinia supports both. Use **setup syntax** (composition API style) — it's more flexible and consistent with Vue 3 patterns:

```typescript
// Setup syntax (recommended)
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const total = computed(() => items.value.reduce((sum, i) => sum + i.price, 0))

  function addItem(product: Product) {
    items.value.push({ ...product, quantity: 1 })
  }

  return { items, total, addItem }
})
```

```typescript
// Options syntax (also works, just less flexible)
export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] as CartItem[] }),
  getters: {
    total: (state) => state.items.reduce((sum, i) => sum + i.price, 0),
  },
  actions: {
    addItem(product: Product) {
      this.items.push({ ...product, quantity: 1 })
    },
  },
})
```

### Shared Composables for State

A common pattern: wrap `useState` in a composable that provides typed access and logic:

```typescript
// composables/useCart.ts
interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

export function useCart() {
  const items = useState<CartItem[]>('cart-items', () => [])

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const count = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  function addItem(product: { id: number; name: string; price: number }) {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }

  function removeItem(id: number) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function clear() {
    items.value = []
  }

  return { items, total, count, addItem, removeItem, clear }
}
```

Now any component can `const { items, addItem, total } = useCart()` — shared state, no prop drilling, no store overhead. This pattern is excellent for medium-complexity state that doesn't need Pinia's devtools or plugin system.

### Hydration Caveats

State serialized in the payload must be JSON-serializable. These work:

- Primitives: `string`, `number`, `boolean`, `null`
- Arrays and plain objects
- Nested structures of the above

These **don't** serialize properly:

| Type | Problem | Workaround |
|------|---------|------------|
| `Date` | Becomes a string | Store as ISO string, parse on access |
| `Map` / `Set` | Dropped entirely | Use array/object, convert in getter |
| Functions | Cannot serialize | Keep in composable logic, not state |
| Class instances | Loses prototype | Store plain data, reconstruct in getter |
| Circular references | Throws error | Restructure data |
| `undefined` values in objects | Dropped | Use `null` explicitly |

```typescript
// ✗ Bad — Date will become a string after hydration
const state = useState('event', () => ({
  name: 'Launch',
  date: new Date('2026-01-01'),  // After hydration: "2026-01-01T00:00:00.000Z" (string!)
}))

// ✓ Good — store as ISO string, parse when needed
const state = useState('event', () => ({
  name: 'Launch',
  date: '2026-01-01T00:00:00.000Z',
}))
const eventDate = computed(() => new Date(state.value.date))
```

### When to Use What

| Scenario | Tool | Why |
|----------|------|-----|
| Simple shared value (theme, locale) | `useState` | Minimal, SSR-safe, no dependencies |
| Component-local state | `ref()` / `reactive()` | No need to share, no SSR concern |
| Complex state with actions | Pinia | Actions, getters, devtools, plugins |
| Medium-complexity shared logic | `useState` + composable | Best of both — typed, encapsulated |
| Server-only state | event.context | Never serialized, per-request |
| Persisted state (survives refresh) | Pinia + persistence plugin | `pinia-plugin-persistedstate` |

**My recommendation:** Start with `useState` composables. Move to Pinia when you need:
- More than 2-3 actions per state domain
- Cross-store interactions
- Time-travel debugging in devtools
- Plugin ecosystem (persistence, sync, etc.)

Don't reach for Pinia for a single boolean toggle.

## Walkthrough

1. **Create a shared counter with `useState`:**
   ```typescript
   // composables/useCounter.ts
   export function useCounter() {
     const count = useState('counter', () => 0)
     const increment = () => count.value++
     const decrement = () => count.value--
     return { count, increment, decrement }
   }
   ```
   Use it from two different components. Verify they share the same value.

2. **Demonstrate the cross-request leak:** Create a module-level `ref()` in a composable. Hit the page from two different browsers (incognito tabs). See how state leaks between requests. Then fix it with `useState`.

3. **Set up Pinia:**
   ```bash
   npx nuxi module add pinia
   ```
   Create `stores/auth.ts` with login/logout actions. Access from header and page.

4. **Verify SSR payload:** View page source. Find `window.__NUXT__` — your `useState` and Pinia state values are serialized there.

5. **Test hydration:** Set state on server (in a server plugin or initial load). Verify the client receives it without a flash of wrong content.

## Gotchas

- **`useState` key must be unique app-wide.** If two unrelated composables use `useState('data', ...)`, they share the same ref. Use descriptive, namespaced keys: `'cart-items'`, `'auth-user'`, `'theme-mode'`.
- **Initializer runs once.** `useState('key', () => expensiveComputation())` — the factory only runs on first access. Subsequent calls with the same key ignore the initializer and return the existing value. Don't rely on the initializer for side effects.
- **No non-serializable values.** Functions, class instances, Symbols, Maps, Sets — none of these survive serialization. If you see `undefined` where you expected data after hydration, check serializability.
- **Pinia `storeToRefs` for destructuring.** If you destructure a Pinia store directly, you lose reactivity. Use `storeToRefs(store)` or access via `store.property`:
  ```typescript
  const store = useCartStore()
  // ✗ Loses reactivity
  const { items } = store
  // ✓ Keeps reactivity
  const { items } = storeToRefs(store)
  ```
- **State resets on page refresh.** `useState` and Pinia state live in memory. Hard refresh = gone. For persistence, use `pinia-plugin-persistedstate` or manually sync to localStorage/cookies.
- **Don't mutate state in server middleware for one specific user.** Server middleware runs before your Vue app — if you set `useState` there, it affects the current request only. But be careful not to confuse server middleware (Nitro) with route middleware (Vue). Only route middleware has access to `useState`.

## Exercise

Build a shopping cart:

1. Create `composables/useCart.ts` using `useState`:
   - `addItem(product)` — add or increment quantity
   - `removeItem(id)` — remove from cart
   - `clear()` — empty cart
   - `total` — computed total price
   - `count` — computed total item count

2. Display cart count in the header layout (shared state across pages).

3. Create a `/products` page that lists products with "Add to Cart" buttons.

4. Create a `/cart` page that shows cart contents with remove buttons and total.

5. Verify: navigate between pages — cart state persists. Hard refresh — cart resets (expected).

6. **Bonus:** Rewrite using a Pinia store. Compare the developer experience. Which was simpler for this use case?

## Further Reading

- [State Management Guide](https://nuxt.com/docs/4.x/getting-started/state-management)
- [useState API](https://nuxt.com/docs/4.x/api/composables/use-state)
- [Pinia + Nuxt](https://pinia.vuejs.org/ssr/nuxt.html)
- [pinia-plugin-persistedstate](https://prazdevs.github.io/pinia-plugin-persistedstate/frameworks/nuxt.html)
