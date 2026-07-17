---
title: "Data Fetching"
layout: chapter
nav_order: 5
parent: Home
starter: "04-data-fetching"
official_docs:
  - https://nuxt.com/docs/4.x/getting-started/data-fetching
  - https://nuxt.com/docs/4.x/api/composables/use-fetch
---

# Data Fetching

## TL;DR

Nuxt provides three tools: `useFetch` (the default for component data), `useAsyncData` (custom async logic), and `$fetch` (raw requests in event handlers and server code). `useFetch` handles SSR deduplication, payload serialization, caching, and reactive refetching automatically. Use `$fetch` only in event handlers or server routes where you don't need reactive state.

## Mental Model

The decision tree:

```
Need reactive data in a component template?
├── Yes → Is the data source a URL?
│         ├── Yes → useFetch(url)
│         └── No  → useAsyncData(key, () => myAsyncFn())
└── No → $fetch(url)  (event handlers, server routes, fire-and-forget)
```

The key insight: `useFetch` runs on the server during SSR, serializes the result into the HTML payload, and **skips re-fetching on client hydration**. The client reads from the payload — zero duplicate requests. On subsequent client-side navigations, it fetches fresh data from the client.

```
First page load (SSR):
  Server: useFetch → HTTP request → data → render HTML + embed in payload
  Client: hydrate → read from payload → no request

Client navigation:
  Client: useFetch → HTTP request → data → re-render component
```

### useFetch vs useAsyncData vs $fetch

| | `useFetch` | `useAsyncData` | `$fetch` |
|---|---|---|---|
| SSR payload dedup | ✓ | ✓ | ✗ |
| Reactive state | ✓ | ✓ | ✗ |
| Auto-key generation | ✓ | manual key | n/a |
| Caching (getCachedData) | ✓ | ✓ | ✗ |
| Use in templates | ✓ | ✓ | ✗ (no reactive ref) |
| Use in event handlers | ✗ | ✗ | ✓ |
| Use in server routes | ✗ | ✗ | ✓ |

**`useFetch(url, options)`** — sugar for `useAsyncData(key, () => $fetch(url, options))`. Use it for straightforward API calls.

**`useAsyncData(key, handler)`** — when your data comes from something other than a URL (a composable, multiple requests combined, complex logic). You provide the key and the fetcher.

**`$fetch(url)`** — raw `ofetch` (Nuxt's HTTP client). No SSR magic, no reactive state. Use in `@click` handlers, form submissions, server routes, or anywhere you don't need the composable wrapper.

### Server vs Client Execution

```vue
<script setup lang="ts">
// This runs on SERVER during SSR, then on CLIENT during navigation
const { data, error, pending } = await useFetch('/api/users')
</script>
```

During SSR:
1. `useFetch` calls `$fetch('/api/users')` on the server
2. Nitro intercepts the request internally (no actual HTTP call — it calls the handler directly)
3. Result is serialized into the HTML payload (`<script>window.__NUXT__=...`)
4. Component renders with data

During hydration:
1. Client reads data from payload
2. No network request fires
3. Component hydrates with the same data

During client navigation:
1. `useFetch` fires a real HTTP request to `/api/users`
2. Returns response, updates reactive state

### The Return Object

```typescript
const {
  data,      // Ref<T | null> — the response data
  error,     // Ref<Error | null> — error if request failed
  pending,   // Ref<boolean> — true while loading
  status,    // Ref<'idle' | 'pending' | 'success' | 'error'>
  refresh,   // () => Promise<void> — refetch (uses cache key)
  execute,   // () => Promise<void> — same as refresh
  clear,     // () => void — clear data and error
} = useFetch('/api/users')
```

All values are refs — reactive and template-ready:

```vue
<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <ul v-else>
    <li v-for="user in data" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

### Caching with getCachedData

By default, `useFetch` doesn't cache across navigations — every navigation triggers a fresh request. To enable caching:

```vue
<script setup lang="ts">
const { data } = await useFetch('/api/users', {
  getCachedData(key, nuxtApp) {
    // Return cached data if available and not stale
    const cached = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
    if (!cached) return undefined  // undefined = fetch again

    return cached  // Return cached value = skip fetch
  },
})
</script>
```

**Stale-while-revalidate pattern:**

```vue
<script setup lang="ts">
const STALE_TIME = 30_000 // 30 seconds

const { data } = await useFetch('/api/users', {
  getCachedData(key, nuxtApp) {
    const cached = nuxtApp.payload.data[key]
    if (!cached) return undefined

    // Check if data is stale
    const fetchedAt = nuxtApp.payload._fetchedAt?.[key]
    if (fetchedAt && Date.now() - fetchedAt > STALE_TIME) {
      return undefined // Stale — refetch
    }

    return cached // Fresh — use cache
  },
  onResponse({ response }) {
    // Track when data was fetched
    const nuxtApp = useNuxtApp()
    nuxtApp.payload._fetchedAt = nuxtApp.payload._fetchedAt || {}
    nuxtApp.payload._fetchedAt[key] = Date.now()
  },
})
</script>
```

This gives you instant back-navigation (show cached data) while still refreshing stale data.

### Watch and Reactive Refetching

`useFetch` can reactively refetch when dependencies change:

```vue
<script setup lang="ts">
const page = ref(1)
const search = ref('')

// Refetches whenever page or search changes
const { data } = await useFetch('/api/users', {
  query: { page, search },  // Reactive query params
  watch: [page, search],     // Explicit watch sources (optional when using reactive query)
})
</script>

<template>
  <input v-model="search" placeholder="Search..." />
  <button @click="page++">Next Page</button>
  <UserList :users="data" />
</template>
```

When you pass reactive values to `query`, `useFetch` automatically watches them and refetches. The `watch` option is for cases where you need to trigger a refetch based on values NOT in the URL (e.g., a filter stored in a composable).

### Lazy Mode

By default, `useFetch` blocks navigation — the new page doesn't render until data arrives. Lazy mode changes this:

```vue
<script setup lang="ts">
// Non-blocking — page renders immediately, data arrives later
const { data, pending } = useLazyFetch('/api/slow-endpoint')
// or: useFetch('/api/slow-endpoint', { lazy: true })
</script>

<template>
  <SkeletonLoader v-if="pending" />
  <Content v-else :data="data" />
</template>
```

Use lazy mode for:
- Secondary data that shouldn't block page render
- Below-the-fold content
- Data that's nice-to-have but not critical

Keep blocking mode (default) for:
- Primary page content
- Data needed for the page to make sense
- SEO-critical content (lazy data isn't in the initial HTML during SSR)

**Note:** `useLazyFetch` still runs on the server during SSR. It just doesn't block the response. The HTML ships with `pending: true` state and the client completes the fetch.

### Transform and Pick

**`transform`** — reshape data before it hits your component:

```vue
<script setup lang="ts">
const { data: users } = await useFetch('/api/users', {
  transform: (response) => {
    // API returns { data: [...], meta: {...} }
    // Component only needs the array
    return response.data.map(user => ({
      id: user.id,
      displayName: `${user.firstName} ${user.lastName}`,
      avatar: user.profileImage?.url ?? '/default-avatar.png',
    }))
  },
})
</script>
```

Transform runs after the fetch, before caching. The cached/payload value is the transformed result — keeps your payload small.

**`pick`** — select specific top-level keys from the response:

```vue
<script setup lang="ts">
// API returns { id, name, email, address, phone, company, ... }
// You only need id and name
const { data } = await useFetch('/api/users/1', {
  pick: ['id', 'name'],
})
// data.value = { id: 1, name: 'John' }
```

`pick` only works on top-level keys. For deeper extraction, use `transform`.

### $fetch in Event Handlers

Never use `useFetch` inside event handlers or callbacks — it's a composable that must run in setup context:

```vue
<script setup lang="ts">
// ✓ useFetch for reactive data
const { data: users, refresh } = await useFetch('/api/users')

// ✓ $fetch for mutations/actions
const deleteUser = async (id: number) => {
  await $fetch(`/api/users/${id}`, { method: 'DELETE' })
  refresh() // Refresh the list after deletion
}

const createUser = async (form: UserForm) => {
  const newUser = await $fetch('/api/users', {
    method: 'POST',
    body: form,
  })
  // Option 1: refresh the list
  refresh()
  // Option 2: optimistically update
  users.value = [...users.value!, newUser]
}
</script>
```

### useAsyncData for Custom Logic

When you need more than a simple URL fetch:

```vue
<script setup lang="ts">
// Combine multiple requests
const { data: dashboardData } = await useAsyncData('dashboard', async () => {
  const [users, posts, stats] = await Promise.all([
    $fetch('/api/users'),
    $fetch('/api/posts'),
    $fetch('/api/stats'),
  ])
  return { users, posts, stats }
})

// Use a third-party SDK
const { data: products } = await useAsyncData('products', () => {
  return stripeClient.products.list({ limit: 10 })
})
```

The key (first argument) must be unique across your app. Nuxt uses it for payload serialization and deduplication.

### Request Deduplication

During SSR, if two components call `useFetch('/api/users')` with the same URL and options, Nuxt makes **one** request and shares the result. The key is auto-generated from the URL + options. This prevents N+1 fetch waterfalls.

For `useAsyncData`, you control the key — same key = same data shared:

```vue
<!-- ComponentA.vue -->
<script setup>
const { data } = await useAsyncData('shared-users', () => $fetch('/api/users'))
</script>

<!-- ComponentB.vue -->
<script setup>
// Same key — reuses ComponentA's request during SSR
const { data } = await useAsyncData('shared-users', () => $fetch('/api/users'))
</script>
```

## Walkthrough

Open the `04-data-fetching` starter:

```bash
cd starters/04-data-fetching
npm install
npm run dev
```

1. **Check the server API.** Look at `server/api/` — these provide the data endpoints.
2. **Inspect useFetch usage.** Open the page components — see how they fetch and display data.
3. **View the payload.** View page source — find `window.__NUXT__` script. That's the serialized SSR data.
4. **Test deduplication.** Open Network tab, hard-refresh the page. Count the API requests made during SSR vs what appears in payload.
5. **Add getCachedData.** Implement the stale-while-revalidate pattern. Navigate away and back — verify the data loads instantly from cache.
6. **Add a mutation.** Create a form that uses `$fetch` with POST, then calls `refresh()` to update the list.

## Gotchas

- **Don't use `useFetch` in event handlers.** It's a composable — must run in setup context (top-level `<script setup>`). Use `$fetch` for mutations and actions triggered by user interaction.
- **Don't use `useFetch` conditionally.** Like all Vue composables, it must run on every render. Can't be inside `if` blocks or after early returns. Use the `immediate: false` option + `execute()` if you need conditional fetching.
- **Watch sources must be reactive.** `watch: [page]` only works if `page` is a `ref` or `computed`. Raw values won't trigger refetches.
- **`getCachedData` returning `undefined` means "fetch again."** Any other value (even `null`) means "use this as the data." Be explicit.
- **`pick` only works on top-level keys.** `pick: ['user.name']` doesn't work. Use `transform` for nested extraction.
- **Key deduplication.** Same URL + same options = same cache key. If you need different data from the same URL (different auth context, different behavior), provide a unique `key` option.
- **Hydration mismatch with conditional useFetch.** If `useFetch` runs on the server but not on the client (or vice versa), you'll get hydration errors. Ensure the composable runs in both environments consistently.
- **`useFetch` to your own API is free during SSR.** When you `useFetch('/api/users')` during SSR, Nuxt calls the handler directly — no HTTP round-trip. This is why internal API calls are fast during SSR.
- **Payload size.** Everything `useFetch` returns during SSR goes into the HTML payload. Fetching 1000 records means 1000 records in your HTML source. Use `transform` or `pick` to trim it. Or paginate.

## Exercise

1. Build a paginated user list:
   - `useFetch('/api/users', { query: { page, limit: 10 } })`
   - Page ref that increments/decrements
   - Loading skeleton while `pending` is true
   - Error message when `error` is set

2. Build a user detail page (`/users/[id]`):
   - `useFetch` with the dynamic param
   - Implement `getCachedData` that returns stale data for 30 seconds
   - Navigate away and back — verify instant load from cache

3. Add a "Create User" form:
   - Use `$fetch` with POST on submit
   - After success, call `refresh()` on the list

4. Add a "Refresh" button that calls `refresh()` to manually refetch the list.

## Further Reading

- [Data Fetching Guide](https://nuxt.com/docs/4.x/getting-started/data-fetching)
- [useFetch API](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [useAsyncData API](https://nuxt.com/docs/4.x/api/composables/use-async-data)
- [$fetch Utility](https://nuxt.com/docs/4.x/api/utils/dollarfetch)
- [ofetch Documentation](https://github.com/unjs/ofetch)
