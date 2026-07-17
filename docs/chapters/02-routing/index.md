---
render_with_liquid: false
title: "Routing"
layout: chapter
nav_order: 3
parent: Home
starter: "02-routing"
official_docs:
  - https://nuxt.com/docs/4.x/getting-started/routing
  - https://nuxt.com/docs/4.x/api/components/nuxt-link
---

# Routing

## TL;DR

Nuxt generates vue-router configuration from your `pages/` directory structure. No manual route definitions. Dynamic segments use brackets (`[id]`), catch-alls use spread (`[...slug]`), optional params use double brackets (`[[id]]`). Navigate with `<NuxtLink>` (template) or `navigateTo()` (programmatic). Route params are always strings — parse them yourself.

## Mental Model

File system = route table. Nuxt scans `pages/` at build time and generates the equivalent vue-router config. You never write `createRouter({ routes: [...] })`. Every `.vue` file in `pages/` becomes a route. Folders create path segments. The bracket syntax creates dynamic segments.

```
pages/
├── index.vue              → /
├── about.vue              → /about
├── posts/
│   ├── index.vue          → /posts
│   └── [id].vue           → /posts/:id
└── [...slug].vue          → catch-all (404)
```

**Important:** If the `pages/` directory doesn't exist, Nuxt doesn't generate a router at all. Your `app.vue` renders directly without routing. The moment you create `pages/`, Nuxt activates the router and `app.vue` must include `<NuxtPage />` as the route outlet.

### File-Based Routing Mechanics

The mapping rules:

| File path | Route | Notes |
|-----------|-------|-------|
| `pages/index.vue` | `/` | Index routes use the file name `index.vue` |
| `pages/about.vue` | `/about` | File name becomes path segment |
| `pages/users/index.vue` | `/users` | Folder + index = folder path |
| `pages/users/profile.vue` | `/users/profile` | Nested static segment |
| `pages/blog/2024/recap.vue` | `/blog/2024/recap` | Deep nesting works |

The router is generated in `.nuxt/routes.mjs` — you can inspect it to verify your understanding.

### Dynamic Params

Square brackets create dynamic segments:

```
pages/
├── users/
│   ├── [id].vue           → /users/:id (required)
│   └── [[id]].vue         → /users/:id? (optional)
├── posts/
│   └── [slug].vue         → /posts/:slug
└── docs/
    └── [...slug].vue      → /docs/* (catch-all, slug is an array)
```

**`[id].vue`** — Required dynamic param. `/users/123` matches, `/users/` does not.

**`[[id]].vue`** — Optional param. Both `/users/` and `/users/123` match. Use this when a page can render with or without the param (e.g., a filter that defaults to "all").

**`[...slug].vue`** — Catch-all. Captures the entire remaining path as an array. `/docs/getting-started/intro` → `params.slug = ['getting-started', 'intro']`.

Access params in the component:

```vue
<script setup lang="ts">
const route = useRoute()

// For [id].vue at /users/42
const userId = route.params.id  // "42" (always a string!)

// For [...slug].vue at /docs/a/b/c
const parts = route.params.slug  // ["a", "b", "c"]
</script>
```

**Params are always strings.** `/users/42` gives you `"42"`, not `42`. Parse it: `Number(route.params.id)` or validate it (see Route Validation below).

### Nested Routes

Nested routes require two things:
1. A parent `.vue` file with `<NuxtPage />` inside it
2. A same-named folder containing child routes

```
pages/
├── users.vue              → Parent layout (contains <NuxtPage />)
└── users/
    ├── index.vue          → /users (rendered inside users.vue)
    └── [id].vue           → /users/:id (rendered inside users.vue)
```

The parent `users.vue` acts as a persistent wrapper — it stays mounted while children swap:

```vue
<!-- pages/users.vue -->
<template>
  <div>
    <h1>Users Section</h1>
    <nav>
      <NuxtLink to="/users">All Users</NuxtLink>
    </nav>
    <!-- Child routes render here -->
    <NuxtPage />
  </div>
</template>
```

This is how you build tabbed interfaces, master-detail views, or any UI where a parent section wraps multiple sub-pages.

### Navigation

**`<NuxtLink>` — the default choice for navigation:**

```vue
<template>
  <nav>
    <!-- Static route -->
    <NuxtLink to="/about">About</NuxtLink>

    <!-- Dynamic route -->
    <NuxtLink :to="`/users/${user.id}`">{{ user.name }}</NuxtLink>

    <!-- Named route (if you prefer) -->
    <NuxtLink :to="{ name: 'users-id', params: { id: user.id } }">
      {{ user.name }}
    </NuxtLink>

    <!-- External link (renders as <a> with target) -->
    <NuxtLink to="https://nuxt.com" external>Docs</NuxtLink>

    <!-- Disable prefetching for performance -->
    <NuxtLink to="/heavy-page" :prefetch="false">Heavy</NuxtLink>
  </nav>
</template>
```

`<NuxtLink>` gives you:
- **Prefetching** — when the link enters the viewport, Nuxt prefetches the target page's JS chunk. Instant navigation.
- **Active classes** — `.router-link-active` and `.router-link-exact-active` applied automatically. Style them in CSS.
- **Client-side navigation** — no full-page reload. Only the page component swaps.

**`navigateTo()` — programmatic navigation:**

```vue
<script setup lang="ts">
const goToUser = (id: number) => {
  navigateTo(`/users/${id}`)
}

// With options
const goToLogin = () => {
  navigateTo('/login', { redirectCode: 301, replace: true })
}

// External URL
const goToExternal = () => {
  navigateTo('https://example.com', { external: true })
}
</script>
```

**`useRoute()` — read current route state:**

```vue
<script setup lang="ts">
const route = useRoute()
route.params     // Dynamic params
route.query      // Query string (?page=2 → { page: '2' })
route.path       // Current path without query
route.fullPath   // Path + query + hash
route.name       // Route name (generated from file path)
route.meta       // Page meta defined in definePageMeta
</script>
```

**`useRouter()` — router instance (rarely needed directly):**

```vue
<script setup lang="ts">
const router = useRouter()
router.back()
router.forward()
router.push('/somewhere')  // Prefer navigateTo() — it works in SSR too
</script>
```

Prefer `navigateTo()` over `router.push()` because `navigateTo` handles SSR correctly (returns a redirect response on server) while `router.push()` only works client-side.

### Route Validation

Use `definePageMeta` with a `validate` function to guard a route before it renders:

```vue
<!-- pages/users/[id].vue -->
<script setup lang="ts">
definePageMeta({
  validate: (route) => {
    // Must be a numeric ID
    return /^\d+$/.test(route.params.id as string)
  },
})

const route = useRoute()
const userId = Number(route.params.id)
</script>
```

If `validate` returns `false`, Nuxt shows the 404 error page. You can also return an object to customize the error:

```typescript
definePageMeta({
  validate: (route) => {
    const id = Number(route.params.id)
    if (isNaN(id) || id < 1) {
      return createError({
        statusCode: 400,
        statusMessage: 'Invalid user ID',
      })
    }
    return true
  },
})
```

Validation runs before the page component is created — it's the earliest point to reject bad params.

### definePageMeta

Beyond validation, `definePageMeta` configures per-page behavior:

```vue
<script setup lang="ts">
definePageMeta({
  // Which layout to use
  layout: 'admin',

  // Route middleware to apply
  middleware: ['auth', 'admin-only'],

  // Custom meta data (accessible via route.meta)
  title: 'User Profile',

  // Keep-alive (preserve component state on navigation)
  keepalive: true,

  // Page transition
  pageTransition: { name: 'slide-left' },

  // Validation function
  validate: (route) => /^\d+$/.test(route.params.id as string),
})
</script>
```

`definePageMeta` is a compiler macro — it's extracted at build time. You can't use runtime variables in it. Only static values or imported constants.

## Walkthrough

Open the `02-routing` starter:

```bash
cd starters/02-routing
npm install
npm run dev
```

1. **Explore the pages.** Check `pages/` directory — note how file names map to routes.
2. **Test dynamic params.** Navigate to `/posts/1`, `/posts/hello` — check `useRoute().params.id` in each.
3. **Add a catch-all.** Create `pages/[...slug].vue` that shows a custom 404 message with the attempted path.
4. **Test NuxtLink prefetching.** Open Network tab, hover over a `<NuxtLink>` — watch the JS chunk prefetch fire.
5. **Add validation.** On `pages/posts/[id].vue`, add `definePageMeta({ validate })` that rejects non-numeric IDs. Navigate to `/posts/abc` — verify 404.

## Gotchas

- **Missing `pages/` = no router.** If you only have `app.vue` without a `pages/` directory, `<NuxtPage>` does nothing and `useRoute()` isn't available. This is intentional — some apps don't need routing.
- **Route params are always strings.** `/users/42` → `params.id === "42"` not `42`. Always parse. Always validate.
- **`navigateTo` returns a promise.** In middleware, you must `return navigateTo('/login')` — not just call it. Without the return, the middleware continues executing.
- **Prefetching on NuxtLink is aggressive.** In a list of 100 items, each `<NuxtLink>` prefetches when it enters the viewport. For long lists, add `:prefetch="false"` or use `<NuxtLink prefetch-on="interaction">` to only prefetch on hover/focus.
- **Nested routes need BOTH parts.** A `pages/users/` folder without a `pages/users.vue` parent just creates flat routes under `/users/`. The nesting behavior (persistent parent wrapper) only activates when both exist.
- **Route names are auto-generated.** `pages/users/[id].vue` → route name `users-id`. The pattern is path segments joined by hyphens with brackets removed. Use DevTools to see actual names.
- **`definePageMeta` is a compiler macro.** You cannot use `ref()`, `computed()`, or any runtime value inside it. It runs at build time. If you need dynamic meta, use middleware or `useHead()` instead.

## Exercise

Build a mini blog structure:

1. Create pages:
   - `/posts` — list page
   - `/posts/[slug]` — single post (validate: slug must be lowercase-with-dashes only)
   - `/posts/[slug]/comments` — nested under single post (add `posts/[slug].vue` as parent with `<NuxtPage />`)
   - `[...slug].vue` — catch-all 404

2. Add navigation between pages using `<NuxtLink>`.
3. On the catch-all page, display the attempted path from `params.slug`.
4. Add programmatic navigation: a button that calls `navigateTo('/posts')` after a 2-second delay (simulating a redirect after form submission).

## Further Reading

- [Routing Guide](https://nuxt.com/docs/4.x/getting-started/routing)
- [NuxtLink Component](https://nuxt.com/docs/4.x/api/components/nuxt-link)
- [useRoute Composable](https://nuxt.com/docs/4.x/api/composables/use-route)
- [definePageMeta](https://nuxt.com/docs/4.x/api/utils/define-page-meta)
- [navigateTo](https://nuxt.com/docs/4.x/api/utils/navigate-to)
