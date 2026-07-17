---
title: "Error Handling"
layout: chapter
nav_order: 11
parent: Home
starter: "10-errors"
official_docs:
  - https://nuxt.com/docs/4.x/getting-started/error-handling
  - https://nuxt.com/docs/4.x/api/utils/create-error
---

# Error Handling

## TL;DR

Nuxt has two error layers: **full-page errors** (caught by `error.vue` at the project root) and **component-level errors** (caught by `<NuxtErrorBoundary>`). Use `createError` to throw structured errors with status codes from both server and client. Use `showError`/`clearError` to manage the error page programmatically. Server route errors become HTTP responses; rendering errors trigger `error.vue`.

## Mental Model

The error flow:

```
Error occurs
├── In a server route (server/api/) → HTTP error response (4xx/5xx)
│     └── If useFetch catches it → error ref is set, component handles it
│     └── If fatal/uncaught → client shows error.vue
├── During SSR rendering → error.vue replaces the page
├── During client navigation → error.vue replaces the page
└── In a component with NuxtErrorBoundary → #error slot renders (graceful)
```

All errors in Nuxt are structured: `{ statusCode, statusMessage, message, data, stack }`. This consistency means your error UI can always rely on these fields whether the error originated in a server route, a composable, or a client component.

### error.vue

The global error page. Lives at the project root (NOT in `pages/` or `layouts/`):

```vue
<!-- error.vue -->
<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

// Recovery: clear the error and navigate away
const handleClear = () => {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="error-page">
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.statusMessage || 'Something went wrong' }}</p>

    <!-- Show detailed message in dev -->
    <pre v-if="error.data">{{ error.data }}</pre>

    <button @click="handleClear">Go Home</button>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  text-align: center;
}
</style>
```

**Key points:**
- `error.vue` replaces the ENTIRE app when triggered — no layouts, no pages, just this component.
- It receives the error object as a prop.
- You MUST call `clearError()` to recover. Just calling `navigateTo()` won't work — the error state persists.
- `clearError({ redirect: '/' })` clears the error AND navigates in one step.

**Differentiate error types:**

```vue
<template>
  <div class="error-page">
    <!-- 404: Not Found -->
    <template v-if="error.statusCode === 404">
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <NuxtLink to="/" @click="clearError">Back to Home</NuxtLink>
    </template>

    <!-- 403: Forbidden -->
    <template v-else-if="error.statusCode === 403">
      <h1>Access Denied</h1>
      <p>You don't have permission to view this page.</p>
      <button @click="clearError({ redirect: '/login' })">Sign In</button>
    </template>

    <!-- 500+: Server Error -->
    <template v-else>
      <h1>Something Broke</h1>
      <p>We're working on it. Try again shortly.</p>
      <button @click="clearError({ redirect: '/' })">Go Home</button>
    </template>
  </div>
</template>
```

### NuxtErrorBoundary

Catches rendering errors in a section of your UI without taking down the entire page:

```vue
<template>
  <div class="dashboard">
    <AppHeader />

    <!-- If this widget fails, only this section shows error -->
    <NuxtErrorBoundary @error="logError">
      <AnalyticsWidget />

      <template #error="{ error, clearError }">
        <div class="widget-error">
          <p>Analytics failed to load: {{ error.message }}</p>
          <button @click="clearError">Retry</button>
        </div>
      </template>
    </NuxtErrorBoundary>

    <!-- This keeps working even if analytics fails -->
    <UserList />
  </div>
</template>

<script setup lang="ts">
function logError(error: Error) {
  console.error('Widget error:', error)
  // Send to error tracking service
}
</script>
```

**How it works:**
- `<NuxtErrorBoundary>` wraps a section of your template.
- If any child component throws during render or setup, the `#error` slot is shown instead.
- The `#error` slot receives `{ error, clearError }` — clear to attempt re-render.
- The `@error` event fires when an error is caught (use for logging/reporting).

**Retry pattern:**

```vue
<NuxtErrorBoundary>
  <DataTable :key="retryKey" :data="tableData" />

  <template #error="{ error, clearError }">
    <div class="error-card">
      <p>Failed to render table: {{ error.message }}</p>
      <button @click="() => { retryKey++; clearError() }">
        Retry
      </button>
    </div>
  </template>
</NuxtErrorBoundary>

<script setup>
const retryKey = ref(0)
</script>
```

Incrementing the key forces the component to re-mount (fresh instance), then `clearError()` clears the boundary's error state.

### createError

The unified way to throw structured errors:

```typescript
// In a server route — becomes HTTP error response
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const user = findUser(id)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
      message: `No user with ID ${id} exists`,
      data: { requestedId: id },
    })
  }

  return user
})
```

```vue
<!-- In a page/component — triggers error.vue if fatal -->
<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.id)

if (isNaN(id)) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid ID',
    fatal: true,  // ← This triggers error.vue
  })
}
</script>
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `statusCode` | number | HTTP status code (404, 500, etc.) |
| `statusMessage` | string | Short description (shown to users) |
| `message` | string | Detailed message (for debugging) |
| `data` | any | Additional data payload |
| `fatal` | boolean | If true on client, triggers error.vue immediately |
| `unhandled` | boolean | Marks as unhandled (for error tracking) |

**`fatal` flag behavior:**
- `fatal: true` — error.vue takes over immediately. The page is replaced.
- `fatal: false` (default) — error can be caught by `<NuxtErrorBoundary>` or handled in `useFetch`'s error ref. Doesn't automatically show error.vue.

### showError / clearError

Programmatic control over the error page:

```typescript
// Show error page manually (e.g., after a client-side check)
showError({
  statusCode: 403,
  statusMessage: 'Subscription expired',
  data: { plan: 'free', expiredAt: '2026-01-01' },
})

// Clear error and optionally redirect
clearError()                         // Just clear, stay on current URL
clearError({ redirect: '/' })        // Clear and navigate
clearError({ redirect: '/login' })   // Clear and redirect to login
```

**Use cases for `showError`:**
- After a client-side permission check fails
- When a required resource fails to load and the page can't function
- As an alternative to `throw createError({ fatal: true })` when you need more control

### Server Route Error Handling

In server routes, errors become HTTP responses:

```typescript
// server/api/users/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // Validation error → 400
  if (!id || isNaN(Number(id))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'ID must be a number',
    })
  }

  const user = await db.users.findById(Number(id))

  // Not found → 404
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `User ${id} does not exist`,
    })
  }

  // Authorization → 403
  const requester = event.context.user
  if (requester.role !== 'admin' && requester.id !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'You can only view your own profile',
    })
  }

  return user
})
```

The client receives a JSON error response:

```json
{
  "statusCode": 404,
  "statusMessage": "Not Found",
  "message": "User 42 does not exist",
  "data": null
}
```

When `useFetch` encounters this, the `error` ref is populated:

```vue
<script setup lang="ts">
const { data: user, error } = await useFetch(`/api/users/${route.params.id}`)
</script>

<template>
  <div v-if="error">
    <p v-if="error.statusCode === 404">User not found</p>
    <p v-else>Error: {{ error.message }}</p>
  </div>
  <UserProfile v-else-if="user" :user="user" />
</template>
```

### Handling useFetch Errors

`useFetch` catches server errors gracefully — they don't trigger `error.vue` by default:

```vue
<script setup lang="ts">
const { data, error, pending, refresh } = await useFetch('/api/data')

// Watch for errors and show notification
watch(error, (err) => {
  if (err) {
    const { error: showNotification } = useNotifications()
    showNotification(err.statusMessage || 'Failed to load data')
  }
})
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error" class="error-state">
    <p>{{ error.statusMessage }}</p>
    <button @click="refresh()">Try Again</button>
  </div>
  <div v-else>{{ data }}</div>
</template>
```

### Global Error Handling

For uncaught errors (runtime errors that escape boundaries), use a Vue error handler:

```typescript
// plugins/error-handler.ts
export default defineNuxtPlugin((nuxtApp) => {
  // Vue rendering errors
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.error('Vue Error:', error)
    console.error('Component:', instance)
    console.error('Info:', info)

    // Send to error tracking (Sentry, DataDog, etc.)
    if (import.meta.client) {
      // reportToSentry(error, { component: instance, info })
    }
  }

  // Nuxt hook for any unhandled error
  nuxtApp.hook('vue:error', (error, instance, info) => {
    // Same as above but Nuxt-flavored hook
  })

  // App-level error hook (lifecycle errors)
  nuxtApp.hook('app:error', (error) => {
    console.error('App error:', error)
  })
})
```

### Error Handling Strategy

The recommended approach for a production app:

1. **Server routes:** Always `throw createError()` with appropriate status codes. Never let raw errors leak to clients.

2. **Data fetching:** Handle `error` ref from `useFetch`/`useAsyncData` in templates. Show inline error states with retry buttons.

3. **Critical page errors:** Use `createError({ fatal: true })` or `showError()` to trigger `error.vue` when the page genuinely can't function.

4. **Widget/section errors:** Wrap non-critical sections in `<NuxtErrorBoundary>` so a failing widget doesn't kill the whole page.

5. **Global tracking:** Add an error handler plugin that reports to your error tracking service.

6. **error.vue:** Always provide a clear path back (Go Home button, navigation links). Never leave users stuck.

## Walkthrough

1. **Create `error.vue`** at the project root:
   - Show different UI for 404 vs 403 vs 500
   - Add a "Go Home" button that calls `clearError({ redirect: '/' })`
   - Style it to look intentional (not broken)

2. **Throw a 404 from a server route:**
   ```typescript
   // server/api/posts/[slug].get.ts
   throw createError({ statusCode: 404, statusMessage: 'Post not found' })
   ```
   Navigate to a non-existent post — verify error.vue shows.

3. **Use NuxtErrorBoundary:**
   - Create a component that throws during render (e.g., accessing `.value` of undefined)
   - Wrap in `<NuxtErrorBoundary>` with an `#error` slot
   - Verify the rest of the page works fine

4. **Handle useFetch errors inline:**
   - Fetch from an endpoint that sometimes returns 500
   - Display error message + retry button in the component
   - Verify error.vue is NOT triggered (inline handling takes precedence)

5. **Use showError from client:**
   - Check a condition after data loads (e.g., user doesn't own this resource)
   - Call `showError({ statusCode: 403, statusMessage: 'Not your resource' })`

## Gotchas

- **`error.vue` is at the project root**, not in `pages/` or `layouts/`. Putting it in the wrong place means it won't be found.
- **`clearError()` is mandatory for recovery.** Just calling `navigateTo('/')` without `clearError()` leaves the error state active — the user stays on the error page or gets stuck.
- **`NuxtErrorBoundary` doesn't catch async errors in event handlers.** Only errors thrown during render/setup are caught. An error in `@click="doSomething"` escapes the boundary. Catch those with try/catch in the handler.
- **`createError` without `fatal: true` on the client doesn't trigger error.vue.** It's catchable by boundaries or useFetch. Only `fatal: true` (or `showError()`) forces the full-page error view.
- **Server route errors are HTTP responses, not rendering errors.** They return JSON to the client. They don't automatically show error.vue. The client component that called `useFetch` must decide how to present the error.
- **Middleware errors.** If `navigateTo()` in middleware targets a page that throws during render, the error propagates to `error.vue`. Be careful with redirect targets.
- **No layouts in error.vue.** Since error.vue replaces the entire app, it has no access to layouts, `NuxtPage`, or other routing infrastructure. Style it self-contained.
- **Dev vs production error details.** In development, error stack traces and messages are verbose. In production, Nuxt strips sensitive details. Use the `data` field for information that should always be available in error.vue.
- **`createError` in SSR setup.** If you `throw createError({ statusCode: 404 })` in a page's `<script setup>`, Nuxt returns a 404 HTTP response (correct status code in the response headers) AND shows error.vue. This is the proper way to implement 404 pages for dynamic routes.

## Exercise

Build a comprehensive error handling system:

1. **`error.vue`** — differentiated UI:
   - 404: "Page not found" with search suggestion
   - 403: "Access denied" with login link
   - 500: "Something broke" with "Try Again" that reloads
   - Generic: fallback for any other status code

2. **Server route that throws 404:**
   - `GET /api/posts/[slug]` — returns post or throws 404
   - Make `useFetch` handle the error inline on the detail page

3. **`<NuxtErrorBoundary>` with retry:**
   - Wrap a flaky component (simulate random failures)
   - Show error message in `#error` slot
   - "Retry" button that increments a key and calls `clearError`

4. **Client-side `showError`:**
   - After fetching a resource, check if the user owns it
   - If not, `showError({ statusCode: 403 })` 

5. **Error tracking plugin:**
   - `plugins/error-tracker.ts`
   - Hook into `vue:error` and `app:error`
   - Log to console with structured data (simulate sending to Sentry)

## Further Reading

- [Error Handling Guide](https://nuxt.com/docs/4.x/getting-started/error-handling)
- [createError](https://nuxt.com/docs/4.x/api/utils/create-error)
- [showError](https://nuxt.com/docs/4.x/api/utils/show-error)
- [clearError](https://nuxt.com/docs/4.x/api/utils/clear-error)
- [NuxtErrorBoundary](https://nuxt.com/docs/4.x/api/components/nuxt-error-boundary)
