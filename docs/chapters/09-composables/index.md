---
render_with_liquid: false
title: "Composables"
layout: chapter
nav_order: 10
parent: Home
starter: "09-composables"
official_docs:
  - https://nuxt.com/docs/4.x/guide/directory-structure/composables
  - https://nuxt.com/docs/4.x/api/composables/use-runtime-config
---

# Composables

## TL;DR

Composables are reusable functions that encapsulate reactive logic. Nuxt auto-imports from `composables/` (top-level files and named exports from subdirectory `index.ts` files) and `utils/` (pure helpers). `useRuntimeConfig` provides environment-specific settings; `useAppConfig` provides bundled app settings. The `use` prefix is convention — any exported function from these directories is auto-imported.

## Mental Model

Two directories, two purposes:

- **`composables/`** — reactive logic functions (typically `use` prefixed). These wrap `ref`, `computed`, `watch`, `useFetch`, `useState`. They're the building blocks of your feature logic.
- **`utils/`** — pure helper functions. Formatters, validators, parsers. No Vue reactivity inside. Think lodash-style utilities.

Both are auto-imported app-wide. You never write `import { useCounter } from '~/composables/useCounter'` — it's just available.

**Scan rules:**
- `composables/` scans **top-level files** and **`index.ts` named exports from subdirectories**
- `utils/` scans the **same way**
- Nested files that aren't re-exported from an index are NOT auto-imported

```
composables/
├── useCounter.ts         ✓ Auto-imported (top-level)
├── useAuth.ts            ✓ Auto-imported (top-level)
├── helpers.ts            ✓ Auto-imported (top-level, all exports)
└── api/
    ├── index.ts          ✓ Named exports auto-imported
    ├── useUsers.ts       ✗ NOT auto-imported (nested, no index re-export)
    └── usePosts.ts       ✗ NOT auto-imported (nested, no index re-export)
```

To auto-import from subdirectories, re-export from `index.ts`:

```typescript
// composables/api/index.ts
export { useUsers } from './useUsers'
export { usePosts } from './usePosts'
```

Or configure explicit directory scanning in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  imports: {
    dirs: ['composables/**'],  // Scan all subdirectories
  },
})
```

### Writing Custom Composables

The core pattern:

```typescript
// composables/useCounter.ts
export function useCounter(initial = 0) {
  const count = ref(initial)
  const doubled = computed(() => count.value * 2)

  function increment() { count.value++ }
  function decrement() { count.value-- }
  function reset() { count.value = initial }

  return { count, doubled, increment, decrement, reset }
}
```

**Principles:**
1. **Start with `use` prefix** — convention that signals "this is a composable with reactive behavior"
2. **Return reactive state and methods** — consumers destructure what they need
3. **Single responsibility** — one composable, one concern. `useAuth`, `useCart`, `useSearch` — not `useEverything`
4. **Composable composition** — composables can use other composables internally

```typescript
// composables/useApi.ts — composes useRuntimeConfig + useFetch
export function useApi<T>(path: string, options?: Parameters<typeof useFetch>[1]) {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  return useFetch<T>(`${baseURL}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      'X-App-Version': '1.0.0',
    },
  })
}
```

### Shared State Composable Pattern

The most powerful Nuxt composable pattern — wraps `useState` for shared reactive state:

```typescript
// composables/useNotifications.ts
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timeout?: number
}

export function useNotifications() {
  const notifications = useState<Notification[]>('notifications', () => [])

  function show(type: Notification['type'], message: string, timeout = 5000) {
    const id = crypto.randomUUID()
    notifications.value.push({ id, type, message, timeout })

    if (timeout > 0) {
      setTimeout(() => dismiss(id), timeout)
    }

    return id
  }

  function dismiss(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function clear() {
    notifications.value = []
  }

  // Convenience methods
  const success = (msg: string) => show('success', msg)
  const error = (msg: string) => show('error', msg, 0) // No auto-dismiss for errors
  const warning = (msg: string) => show('warning', msg)
  const info = (msg: string) => show('info', msg)

  return { notifications, show, dismiss, clear, success, error, warning, info }
}
```

Every component that calls `useNotifications()` shares the same state. The header shows the notification list, a form handler triggers `error()`, a success page triggers `success()` — all coordinated without prop drilling or event buses.

### Async Composable Pattern

Wrap data fetching logic for reuse across pages:

```typescript
// composables/useUsers.ts
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

export function useUsers() {
  const { data: users, pending, error, refresh } = useFetch<User[]>('/api/users')

  const admins = computed(() =>
    users.value?.filter(u => u.role === 'admin') ?? []
  )

  async function createUser(payload: Omit<User, 'id'>) {
    const newUser = await $fetch<User>('/api/users', {
      method: 'POST',
      body: payload,
    })
    refresh()
    return newUser
  }

  async function deleteUser(id: number) {
    await $fetch(`/api/users/${id}`, { method: 'DELETE' })
    refresh()
  }

  return { users, admins, pending, error, refresh, createUser, deleteUser }
}
```

Now any page can `const { users, createUser, deleteUser } = useUsers()` and get the full CRUD interface with caching and shared state.

### useRuntimeConfig

Access values from `nuxt.config.ts` `runtimeConfig`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    apiSecret: '',           // Server-only (NUXT_API_SECRET)
    public: {
      apiBase: '/api',       // Client + server (NUXT_PUBLIC_API_BASE)
      appVersion: '1.0.0',
    },
  },
})
```

```typescript
// In a composable or component (client + server)
const config = useRuntimeConfig()
config.public.apiBase      // ✓ available
config.public.appVersion   // ✓ available
config.apiSecret           // ✗ undefined on client, ✓ on server

// In a server route
export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  config.apiSecret  // ✓ available (server-only)
})
```

**When to use runtimeConfig:**
- API base URLs that change per environment
- Feature flags that toggle per deployment
- Third-party service keys (private only!)
- Any value that should be overridable via environment variables without rebuilding

### useAppConfig

Access values from `app.config.ts` (a separate file from `nuxt.config.ts`):

```typescript
// app.config.ts
export default defineAppConfig({
  ui: {
    primaryColor: '#3b82f6',
    borderRadius: '0.5rem',
    darkMode: false,
  },
  site: {
    name: 'My App',
    description: 'A dense Nuxt app',
  },
})
```

```vue
<script setup lang="ts">
const appConfig = useAppConfig()
// appConfig.ui.primaryColor → '#3b82f6'
// Reactive! Hot-reloaded in dev when you edit app.config.ts
</script>
```

**runtimeConfig vs appConfig:**

| | runtimeConfig | appConfig |
|---|---|---|
| Source file | `nuxt.config.ts` | `app.config.ts` |
| Env var override | ✓ (NUXT_ prefix) | ✗ |
| Bundled in app | Public keys only | Entirely |
| Reactive in dev | ✗ (restart needed) | ✓ (hot-reloaded) |
| Use for | Secrets, per-env URLs, feature flags | Theme, UI settings, branding |
| Private keys | ✓ (server-only) | ✗ (everything is public) |

**Rule:** If it's a secret or per-environment, use `runtimeConfig`. If it's UI/theme configuration that's the same across all environments, use `appConfig`.

### utils/ Directory

For pure helper functions that don't use Vue reactivity:

```typescript
// utils/formatDate.ts
export function formatDate(date: string | Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

// utils/formatCurrency.ts
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// utils/slugify.ts
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

Auto-imported everywhere — use directly in templates and scripts:

```vue
<template>
  <time>{{ formatDate(post.createdAt) }}</time>
  <span>{{ formatCurrency(product.price) }}</span>
</template>
```

### Factory Composable Pattern

When you need configured instances:

```typescript
// composables/useForm.ts
interface FormOptions<T> {
  initialValues: T
  validate?: (values: T) => Record<string, string>
  onSubmit: (values: T) => Promise<void>
}

export function useForm<T extends Record<string, any>>(options: FormOptions<T>) {
  const values = ref({ ...options.initialValues }) as Ref<T>
  const errors = ref<Record<string, string>>({})
  const submitting = ref(false)
  const dirty = ref(false)

  watch(values, () => { dirty.value = true }, { deep: true })

  function setError(field: string, message: string) {
    errors.value[field] = message
  }

  function clearErrors() {
    errors.value = {}
  }

  async function submit() {
    clearErrors()

    if (options.validate) {
      const validationErrors = options.validate(values.value)
      if (Object.keys(validationErrors).length > 0) {
        errors.value = validationErrors
        return
      }
    }

    submitting.value = true
    try {
      await options.onSubmit(values.value)
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    values.value = { ...options.initialValues }
    clearErrors()
    dirty.value = false
  }

  return { values, errors, submitting, dirty, submit, reset, setError, clearErrors }
}
```

Usage:

```vue
<script setup lang="ts">
const { values, errors, submitting, submit } = useForm({
  initialValues: { email: '', password: '' },
  validate: (v) => {
    const e: Record<string, string> = {}
    if (!v.email) e.email = 'Required'
    if (v.password.length < 8) e.password = 'Min 8 characters'
    return e
  },
  onSubmit: async (data) => {
    await $fetch('/api/auth/login', { method: 'POST', body: data })
    navigateTo('/dashboard')
  },
})
</script>
```

### Composables in the Nuxt Lifecycle

Composables that use Nuxt-specific features (`useFetch`, `useState`, `useRoute`) must be called during the setup phase — the synchronous execution of `<script setup>` or `setup()`:

```typescript
// ✓ Called during setup
const { data } = await useFetch('/api/data')

// ✗ Called asynchronously — WILL FAIL
onMounted(async () => {
  const { data } = await useFetch('/api/data')  // Error: Nuxt context not available
})

// ✗ Called in a callback — WILL FAIL
const onClick = async () => {
  const route = useRoute()  // Error: composable called outside setup
}
```

For event handlers, use `$fetch` (not `useFetch`) and access route/config during setup:

```typescript
// ✓ Correct pattern
const route = useRoute()  // Called during setup
const config = useRuntimeConfig()  // Called during setup

const onClick = async () => {
  // Use the refs captured during setup
  await $fetch(`${config.public.apiBase}/action/${route.params.id}`, {
    method: 'POST',
  })
}
```

## Walkthrough

1. **Create `composables/useCounter.ts`** — reactive counter with increment/decrement/reset. Use from two different pages, verify shared instance behavior (with `useState`) vs separate instances (with `ref`).

2. **Create `composables/useApi.ts`** — wraps `useFetch` with `runtimeConfig.public.apiBase`. Use it: `const { data } = useApi<User[]>('/users')`.

3. **Create `utils/formatDate.ts`** — use directly in templates without import.

4. **Create `app.config.ts`** — add UI theme settings. Use `useAppConfig()` in a component. Edit the config file — watch the value hot-reload.

5. **Create a notification composable** — shared state with `useState`, methods to show/dismiss, auto-dismiss timeout. Display in layout, trigger from pages.

## Gotchas

- **Composables must be called synchronously in setup.** Not inside `setTimeout`, `onMounted` callbacks, event handlers, or `then()` chains. Capture refs during setup, use them later.
- **`composables/` subdirectories are NOT auto-scanned by default.** Only top-level files and `index.ts` re-exports work. Configure `imports.dirs` to scan deeper, or use index barrel files.
- **`useRuntimeConfig()` private keys are server-only.** Accessing them on the client returns `undefined`. TypeScript won't warn you — the types include all keys. Guard with `import.meta.server` if needed.
- **Don't use Nuxt composables in `server/` routes.** `useRoute()`, `useFetch()`, `useState()` are Vue-side composables. Server routes use H3 utilities and `useRuntimeConfig()` (which works in both contexts). For shared logic in server routes, use `server/utils/`.
- **`utils/` function names can conflict.** If you have `utils/format.ts` exporting `format()` and a library also exports `format`, you'll get conflicts. Use descriptive names: `formatDate`, `formatCurrency`, `formatBytes`.
- **Composables that return `useFetch` must be awaited at top level.** `const { data } = await useUsers()` — if the composable internally calls `useFetch`, it returns a promise. Forgetting `await` means `data` is the promise, not the ref.
- **No circular dependencies.** If composable A imports composable B which imports composable A — build fails. Structure your composables as a DAG (directed acyclic graph).
- **`useAppConfig` is NOT overridable at runtime.** Values are bundled at build time. If you need per-environment values, use `runtimeConfig` instead.

## Exercise

Create three composables and wire them together:

1. **`composables/useNotifications.ts`** — shared toast notification state:
   - `show(type, message, timeout?)` → returns notification ID
   - `dismiss(id)` → removes notification
   - `success(msg)`, `error(msg)`, `warning(msg)` — convenience methods
   - Auto-dismiss after timeout (except errors)

2. **`composables/useApi.ts`** — configurable fetch wrapper:
   - Reads `apiBase` from `useRuntimeConfig().public`
   - Wraps `useFetch` with base URL prepended
   - On error, auto-calls `useNotifications().error()` with the error message
   - Returns the standard `{ data, pending, error, refresh }` interface

3. **`utils/debounce.ts`** — standard debounce helper:
   - `debounce(fn, ms)` → debounced function
   - Use in a search input that calls `useApi` on debounced input change

Build a page that demonstrates all three working together: a search input (debounced) that fetches results (useApi) and shows error notifications (useNotifications) on failure.

## Further Reading

- [Composables Directory](https://nuxt.com/docs/4.x/guide/directory-structure/composables)
- [Utils Directory](https://nuxt.com/docs/4.x/guide/directory-structure/utils)
- [useRuntimeConfig](https://nuxt.com/docs/4.x/api/composables/use-runtime-config)
- [useAppConfig](https://nuxt.com/docs/4.x/api/composables/use-app-config)
- [Auto-Imports](https://nuxt.com/docs/4.x/guide/concepts/auto-imports)
