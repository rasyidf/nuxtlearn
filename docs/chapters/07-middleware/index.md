---
title: "Middleware & Auth"
layout: chapter
nav_order: 8
parent: Home
starter: "07-middleware"
official_docs:
  - https://nuxt.com/docs/4.x/guide/directory-structure/middleware
  - https://nuxt.com/docs/4.x/api/utils/navigate-to
---

# Middleware & Auth

## TL;DR

Route middleware intercepts navigation and can redirect, block, or pass through. Three types: **global** (every route, `.global.ts` suffix), **named** (reusable files applied via `definePageMeta`), and **inline** (defined directly in a page). Middleware runs on both server and client. Combined with auth state (cookies, tokens), middleware is the standard pattern for protecting routes.

## Mental Model

The execution flow on every navigation:

```
Navigation triggered
  → Global middleware (alphabetical by filename)
  → Named middleware (in definePageMeta order)
  → Inline middleware
  → Page renders (if no redirect/abort happened)
```

Each middleware function receives `to` and `from` route objects. It can:
1. **Return nothing** — allow navigation to continue
2. **Return `navigateTo(path)`** — redirect to a different route
3. **Return `abortNavigation()`** — cancel navigation entirely
4. **Return `abortNavigation(error)`** — cancel and show error page

The first middleware that returns a redirect or abort wins. Remaining middleware doesn't execute.

### Route Middleware Types

**1. Global middleware** — runs on every route change, automatically:

```typescript
// middleware/01.log.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  console.log(`[nav] ${from.path} → ${to.path}`)
})
```

The `.global.ts` suffix is the trigger. Without it, it's a named middleware. Prefix with numbers to control execution order (`01.log.global.ts` runs before `02.auth.global.ts`).

**2. Named middleware** — reusable, applied per-page:

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
```

Applied in the page:

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  // or multiple: middleware: ['auth', 'admin']
})
</script>
```

**3. Inline middleware** — defined directly in `definePageMeta`:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, from) {
      // One-off logic for this page only
      if (to.query.preview !== 'true') {
        return abortNavigation()
      }
    },
  ],
})
</script>
```

Use inline for one-off checks that don't warrant their own file.

### Execution Order

```
01.analytics.global.ts  ← alphabetical global first
02.auth.global.ts
middleware: ['role-check', 'subscription']  ← named in array order
inline function  ← inline last
```

Global middleware sorts alphabetically by filename. Named middleware runs in the order listed in `definePageMeta`. Inline runs last. Use numeric prefixes on globals to make order explicit.

### defineNuxtRouteMiddleware

The wrapper function provides type safety and the correct interface:

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // `to` — the target route (RouteLocationNormalized)
  // `from` — the current route (RouteLocationNormalized)

  // Access route meta
  const requiresAuth = to.meta.requiresAuth

  // Access query params
  const redirectPath = to.query.redirect as string

  // Check auth (your logic)
  const token = useCookie('auth-token')
  if (!token.value) {
    return navigateTo('/login')
  }

  // Return nothing to allow navigation
})
```

### The Auth Guard Pattern

The most common middleware pattern. Here's the full implementation:

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth-token')

  if (!token.value) {
    // Not authenticated — redirect to login
    // Preserve the intended destination
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
```

```typescript
// middleware/guest.ts — opposite: redirect AWAY from login if already auth'd
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth-token')

  if (token.value) {
    // Already authenticated — don't show login page
    return navigateTo(to.query.redirect as string || '/dashboard')
  }
})
```

Apply to pages:

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>

<!-- pages/login.vue -->
<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>
```

**Redirect-after-login pattern:**

```vue
<!-- pages/login.vue -->
<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const route = useRoute()
const token = useCookie('auth-token')

const login = async (credentials: { email: string; password: string }) => {
  const { token: newToken } = await $fetch('/api/auth/login', {
    method: 'POST',
    body: credentials,
  })

  token.value = newToken

  // Redirect to intended destination or default
  const redirect = route.query.redirect as string
  navigateTo(redirect || '/dashboard')
}
</script>
```

### Role-Based Access

Layer middleware for granular access control:

```typescript
// middleware/admin.ts
export default defineNuxtRouteMiddleware(async () => {
  const { data: user } = await useFetch('/api/auth/me')

  if (user.value?.role !== 'admin') {
    return abortNavigation(
      createError({ statusCode: 403, statusMessage: 'Forbidden' })
    )
  }
})
```

```vue
<!-- pages/admin/users.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],  // auth runs first, then admin
})
</script>
```

### Redirect Patterns

```typescript
// Simple redirect
return navigateTo('/login')

// With query params
return navigateTo({ path: '/login', query: { redirect: to.fullPath } })

// Replace history (no back button)
return navigateTo('/login', { replace: true })

// External URL
return navigateTo('https://auth.example.com/login', { external: true })

// With status code (SSR only — affects HTTP response)
return navigateTo('/new-page', { redirectCode: 301 })

// Abort with custom error
return abortNavigation(createError({
  statusCode: 403,
  statusMessage: 'You do not have access to this page',
}))

// Abort silently (stay on current page)
return abortNavigation()
```

### Server Middleware vs Route Middleware

These are **completely different systems** that happen to share the word "middleware":

| | Server Middleware | Route Middleware |
|---|---|---|
| Location | `server/middleware/` | `middleware/` |
| Runs on | Nitro (H3 events) | Vue Router (navigation) |
| Triggers on | Every HTTP request | Client-side navigation + SSR page load |
| Has access to | H3 event, headers, cookies | Route objects, Vue composables |
| Use for | CORS, API auth, logging | Page guards, auth redirects |
| Receives | `event` (H3Event) | `to, from` (RouteLocation) |

**Server middleware** protects your API endpoints. **Route middleware** protects your pages. For a typical auth system, you need both:

```typescript
// server/middleware/api-auth.ts — protects API routes
export default defineEventHandler((event) => {
  const url = getRequestURL(event).pathname
  if (!url.startsWith('/api/protected')) return

  const token = getCookie(event, 'auth-token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  event.context.user = verifyToken(token)
})

// middleware/auth.ts — protects pages (user-facing redirects)
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth-token')
  if (!token.value) {
    return navigateTo('/login')
  }
})
```

### Using Cookies for Auth State

`useCookie` is the SSR-safe way to read/write cookies in Nuxt. It works on both server and client:

```typescript
// composables/useAuth.ts
export function useAuth() {
  const token = useCookie('auth-token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: true,
    httpOnly: false, // Must be false if you read it client-side
    sameSite: 'lax',
  })

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials: LoginCredentials) {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
    token.value = response.token
  }

  function logout() {
    token.value = null
    navigateTo('/login')
  }

  return { token, isAuthenticated, login, logout }
}
```

**Why cookies over localStorage?** Cookies are sent with every request — the server (SSR and API) can read them without additional JavaScript. LocalStorage only exists on the client. With cookies:
- SSR middleware can check auth before rendering
- Server API routes can verify tokens
- No flash of unauthenticated content

### Global Auth with Selective Exclusion

Instead of adding `middleware: 'auth'` to every page, make auth global and opt-out for public pages:

```typescript
// middleware/01.auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  // Skip public routes
  if (to.meta.public) return

  const token = useCookie('auth-token')
  if (!token.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
```

```vue
<!-- pages/login.vue — public page, skip auth -->
<script setup lang="ts">
definePageMeta({
  public: true,  // Custom meta flag read by global middleware
})
</script>

<!-- pages/index.vue — public landing page -->
<script setup lang="ts">
definePageMeta({ public: true })
</script>

<!-- pages/dashboard.vue — protected (no meta needed, default) -->
<script setup lang="ts">
// No definePageMeta needed — auth applies globally
</script>
```

This inverts the pattern: everything is protected by default, public pages opt out. Safer for apps where most pages are authenticated.

## Walkthrough

1. **Create a global logging middleware:**
   ```typescript
   // middleware/00.log.global.ts
   export default defineNuxtRouteMiddleware((to, from) => {
     console.log(`[route] ${from.path} → ${to.path}`)
   })
   ```
   Navigate around. Check browser console.

2. **Create an auth middleware:**
   ```typescript
   // middleware/auth.ts
   export default defineNuxtRouteMiddleware((to) => {
     const token = useCookie('auth-token')
     if (!token.value) {
       return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
     }
   })
   ```

3. **Create a guest middleware:**
   ```typescript
   // middleware/guest.ts
   export default defineNuxtRouteMiddleware(() => {
     const token = useCookie('auth-token')
     if (token.value) return navigateTo('/dashboard')
   })
   ```

4. **Wire up pages:**
   - `/login` with `middleware: 'guest'`
   - `/dashboard` with `middleware: 'auth'`

5. **Implement login:** Set cookie → redirect to `query.redirect` or `/dashboard`.

6. **Test the flow:** Visit `/dashboard` unauthenticated → redirected to `/login?redirect=/dashboard` → login → redirected back to `/dashboard`.

## Gotchas

- **Must `return navigateTo()`.** Just calling `navigateTo('/login')` without `return` doesn't work — the middleware continues executing and the page renders. Always return it.
- **Middleware runs on BOTH server and client.** During SSR, it runs on the server. On client navigation, it runs on the client. Don't use `window`, `document`, or browser-only APIs without `import.meta.client` guard.
- **Infinite redirect loops.** If your auth middleware redirects to `/login`, and `/login` also has auth middleware (or a global middleware that catches it), you get an infinite loop. Always exclude the login page from auth checks.
- **Global middleware filename matters.** Must end in `.global.ts`. `middleware/auth.ts` is named (opt-in). `middleware/auth.global.ts` is global (runs always).
- **Middleware doesn't run on error pages.** If your app shows `error.vue`, middleware is bypassed. Don't rely on middleware for security on error pages.
- **`definePageMeta` is a compiler macro.** You can't conditionally apply middleware with runtime logic inside `definePageMeta`. Use the global middleware + meta flag pattern instead.
- **Order with global middleware.** Alphabetical by filename. `auth.global.ts` runs before `logging.global.ts`. Prefix with numbers: `01.auth.global.ts`, `02.logging.global.ts`.
- **`abortNavigation()` without arguments stays on current page.** The user sees no error, just nothing happens. Provide an error for feedback: `abortNavigation(createError({ statusCode: 403 }))`.
- **`useCookie` during middleware is fine.** It works server and client. But the cookie must be accessible to JavaScript (not `httpOnly: true`) if you need to read it client-side.
- **Middleware runs on every navigation — keep it fast.** Don't make API calls in middleware unless absolutely necessary. Read cookies, check local state, redirect. Heavy validation belongs in the page or a server endpoint.

## Exercise

Implement a complete auth flow:

1. **Server API:**
   - `POST /api/auth/login` — accepts email/password, returns token, sets cookie
   - `GET /api/auth/me` — returns current user from token (or 401)
   - `POST /api/auth/logout` — clears cookie

2. **Middleware:**
   - `auth.ts` — redirects to login if no token (preserves redirect path)
   - `guest.ts` — redirects to dashboard if already authenticated
   - `admin.ts` — checks user role, shows 403 if not admin

3. **Pages:**
   - `/login` — login form, guest middleware, redirect-back-after-login
   - `/register` — registration form, guest middleware
   - `/dashboard` — protected, shows user info
   - `/admin` — protected with `['auth', 'admin']` middleware stack

4. **Composable:**
   - `useAuth()` — wraps cookie, exposes `isAuthenticated`, `login()`, `logout()`

5. **Test:** Full cycle — unauthenticated visit to `/admin` → redirect to `/login?redirect=/admin` → login → redirect to `/admin` → shows 403 (not admin role) or content (admin role).

## Further Reading

- [Middleware Directory](https://nuxt.com/docs/4.x/guide/directory-structure/middleware)
- [navigateTo](https://nuxt.com/docs/4.x/api/utils/navigate-to)
- [abortNavigation](https://nuxt.com/docs/4.x/api/utils/abort-navigation)
- [defineNuxtRouteMiddleware](https://nuxt.com/docs/4.x/api/utils/define-nuxt-route-middleware)
- [useCookie](https://nuxt.com/docs/4.x/api/composables/use-cookie)
