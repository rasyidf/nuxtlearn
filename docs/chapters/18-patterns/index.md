---
render_with_liquid: false
title: "Real-World Patterns"
layout: chapter
nav_order: 19
parent: Home
starter: "18-patterns"
official_docs:
  - https://nuxt.com/modules
---

# Real-World Patterns

## TL;DR

Production Nuxt apps need patterns beyond the core framework: i18n for multilingual support, feature flags for safe rollouts, multi-tenancy for serving multiple clients, WebSocket for real-time communication, and operational concerns like rate limiting and scheduled tasks. This chapter covers the standard approach for each — use these instead of reinventing the wheel.

## Mental Model

These patterns are cross-cutting concerns that layer on top of Nuxt's core features:

```
i18n           → Module + middleware + composable
Feature flags  → runtimeConfig + middleware + server evaluation
Multi-tenancy  → Server middleware + dynamic config + data isolation
WebSocket      → Nitro handler + client composable
Rate limiting  → Server middleware + storage
Scheduled jobs → Nitro tasks + cron
```

Each pattern uses existing Nuxt primitives in a specific way. No magic — just coordinated usage of middleware, server routes, config, and state.

### i18n with @nuxtjs/i18n

The standard solution for internationalization:

```bash
npx nuxi module add i18n
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'id', name: 'Bahasa Indonesia', file: 'id.json' },
    ],
    defaultLocale: 'en',
    lazy: true,           // Load locale files on demand
    langDir: 'locales/',  // Directory for locale files
    strategy: 'prefix_except_default',  // /about (en), /id/about (id)
  },
})
```

```json
// locales/en.json
{
  "welcome": "Welcome to {name}",
  "nav": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "auth": {
    "login": "Sign In",
    "logout": "Sign Out"
  }
}
```

```json
// locales/id.json
{
  "welcome": "Selamat datang di {name}",
  "nav": {
    "home": "Beranda",
    "about": "Tentang",
    "contact": "Kontak"
  },
  "auth": {
    "login": "Masuk",
    "logout": "Keluar"
  }
}
```

Use in components:

```vue
<script setup lang="ts">
const { t, locale, setLocale } = useI18n()
</script>

<template>
  <h1>{{ t('welcome', { name: 'NuxtLearn' }) }}</h1>
  <nav>
    <NuxtLink :to="localePath('/')">{{ t('nav.home') }}</NuxtLink>
    <NuxtLink :to="localePath('/about')">{{ t('nav.about') }}</NuxtLink>
  </nav>

  <!-- Language switcher -->
  <select @change="setLocale(($event.target as HTMLSelectElement).value)">
    <option value="en" :selected="locale === 'en'">English</option>
    <option value="id" :selected="locale === 'id'">Bahasa Indonesia</option>
  </select>
</template>
```

**Route strategies:**
- `prefix_except_default` — `/about` (default lang), `/id/about` (other langs). Best for SEO.
- `prefix` — `/en/about`, `/id/about`. All languages prefixed. Most explicit.
- `no_prefix` — `/about` for all languages. Language determined by cookie/header. Simplest URLs but worst for SEO.

**SEO with i18n** — automatic hreflang tags:

```vue
<script setup>
const { locales } = useI18n()
const route = useRoute()

useHead({
  link: locales.value.map(locale => ({
    rel: 'alternate',
    hreflang: locale.code,
    href: `https://mysite.com${localePath(route.path, locale.code)}`,
  })),
})
</script>
```

### Feature Flags

**Simple approach: runtimeConfig-based flags**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      features: {
        newDashboard: false,
        betaSearch: false,
        darkMode: true,
      },
    },
  },
})
```

```bash
# Enable in production via env var
NUXT_PUBLIC_FEATURES_NEW_DASHBOARD=true
```

```vue
<script setup lang="ts">
const { features } = useRuntimeConfig().public
</script>

<template>
  <NewDashboard v-if="features.newDashboard" />
  <OldDashboard v-else />
</template>
```

**Route-level feature gating with middleware:**

```typescript
// middleware/feature-gate.ts
export default defineNuxtRouteMiddleware((to) => {
  const { features } = useRuntimeConfig().public

  // Gate specific routes behind feature flags
  if (to.path.startsWith('/beta') && !features.betaSearch) {
    return abortNavigation(createError({
      statusCode: 404,
      statusMessage: 'Not Found',
    }))
  }
})
```

**Advanced: Server-evaluated flags (per-user)**

For percentage rollouts, A/B testing, or user-targeted flags:

```typescript
// server/api/features.get.ts
export default defineEventHandler(async (event) => {
  const user = event.context.user // From auth middleware

  // Evaluate flags per-user (from a service or database)
  const flags = await evaluateFlags(user?.id, {
    newDashboard: { percentage: 20 },    // 20% of users
    betaSearch: { allowList: ['admin'] }, // Only admins
    darkMode: { enabled: true },         // Everyone
  })

  return flags
})
```

```vue
<script setup lang="ts">
// Client fetches personalized flags
const { data: features } = await useFetch('/api/features')
</script>
```

### Multi-Tenancy

**Subdomain-based tenancy:**

```typescript
// server/middleware/tenant.ts
export default defineEventHandler((event) => {
  const host = getRequestHost(event)

  // Extract tenant from subdomain: tenant.myapp.com
  const subdomain = host.split('.')[0]

  if (subdomain === 'www' || subdomain === 'myapp') {
    event.context.tenant = 'default'
  } else {
    event.context.tenant = subdomain
  }
})
```

```typescript
// server/api/data.get.ts
export default defineEventHandler(async (event) => {
  const tenant = event.context.tenant

  // Query scoped to tenant
  const data = await db.items.findMany({
    where: { tenantId: tenant },
  })

  return data
})
```

**Path-based tenancy** (simpler, works without DNS config):

```typescript
// server/middleware/tenant.ts
export default defineEventHandler((event) => {
  const url = getRequestURL(event).pathname
  const match = url.match(/^\/t\/([^/]+)/)

  event.context.tenant = match?.[1] || 'default'
})
```

**Per-tenant theming:**

```vue
<script setup lang="ts">
// composables/useTenant.ts
export function useTenant() {
  const tenant = useState<string>('tenant', () => 'default')

  const theme = computed(() => {
    const themes: Record<string, object> = {
      'acme': { primary: '#ff6600', logo: '/tenants/acme/logo.png' },
      'globex': { primary: '#0066ff', logo: '/tenants/globex/logo.png' },
      'default': { primary: '#333333', logo: '/logo.png' },
    }
    return themes[tenant.value] || themes.default
  })

  return { tenant, theme }
}
</script>
```

### WebSocket with Nitro

Nitro supports WebSocket via the `crossws` library:

```typescript
// server/routes/_ws.ts
import type { Peer } from 'crossws'

const peers = new Set<Peer>()

export default defineWebSocketHandler({
  open(peer) {
    peers.add(peer)
    peer.send(JSON.stringify({ type: 'connected', id: peer.id }))
    console.log(`[ws] ${peer.id} connected (${peers.size} total)`)
  },

  message(peer, message) {
    const data = JSON.parse(message.text())

    // Broadcast to all other peers
    for (const p of peers) {
      if (p !== peer) {
        p.send(JSON.stringify({ type: 'message', from: peer.id, data }))
      }
    }
  },

  close(peer) {
    peers.delete(peer)
    console.log(`[ws] ${peer.id} disconnected (${peers.size} total)`)
  },

  error(peer, error) {
    console.error(`[ws] ${peer.id} error:`, error)
    peers.delete(peer)
  },
})
```

**Client-side composable:**

```typescript
// composables/useWebSocket.ts
export function useWebSocket(path = '/_ws') {
  const messages = ref<any[]>([])
  const connected = ref(false)
  let ws: WebSocket | null = null

  function connect() {
    if (import.meta.server) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    ws = new WebSocket(`${protocol}//${window.location.host}${path}`)

    ws.onopen = () => {
      connected.value = true
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      messages.value.push(data)
    }

    ws.onclose = () => {
      connected.value = false
      // Auto-reconnect after 3 seconds
      setTimeout(connect, 3000)
    }
  }

  function send(data: any) {
    ws?.send(JSON.stringify(data))
  }

  function disconnect() {
    ws?.close()
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return { messages, connected, send, disconnect }
}
```

```vue
<script setup>
const { messages, connected, send } = useWebSocket()

function sendMessage(text: string) {
  send({ type: 'chat', text })
}
</script>
```

### Rate Limiting

Server middleware for API rate limiting:

```typescript
// server/middleware/rate-limit.ts
const limits = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60_000  // 1 minute window
const MAX_REQUESTS = 60   // 60 requests per window

export default defineEventHandler((event) => {
  const url = getRequestURL(event).pathname
  if (!url.startsWith('/api')) return // Only limit API routes

  const ip = getRequestIP(event) || 'unknown'
  const key = `${ip}:${url}`
  const now = Date.now()

  let record = limits.get(key)
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + WINDOW_MS }
    limits.set(key)
  }

  record.count++

  // Set rate limit headers
  setHeader(event, 'X-RateLimit-Limit', MAX_REQUESTS.toString())
  setHeader(event, 'X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - record.count).toString())
  setHeader(event, 'X-RateLimit-Reset', Math.ceil(record.resetAt / 1000).toString())

  if (record.count > MAX_REQUESTS) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${Math.ceil((record.resetAt - now) / 1000)}s`,
    })
  }
})
```

**Production: Use Redis for multi-instance deployments:**

```typescript
// server/middleware/rate-limit.ts
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event).pathname
  if (!url.startsWith('/api')) return

  const ip = getRequestIP(event) || 'unknown'
  const key = `rate-limit:${ip}`

  const storage = useStorage('redis')
  const current = await storage.getItem<number>(key) || 0

  if (current >= MAX_REQUESTS) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }

  await storage.setItem(key, current + 1, { ttl: 60 })
})
```

### Background Tasks (Nitro Tasks)

```typescript
// server/tasks/cleanup.ts
export default defineTask({
  meta: {
    name: 'cleanup',
    description: 'Remove expired sessions and temp data',
  },
  async run() {
    const deleted = await db.sessions.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
    console.log(`[cleanup] Removed ${deleted.count} expired sessions`)
    return { result: `Cleaned ${deleted.count} sessions` }
  },
})
```

Enable and schedule:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    experimental: {
      tasks: true,
    },
    scheduledTasks: {
      // Run cleanup every hour
      '0 * * * *': ['cleanup'],
      // Run report generation daily at 2am
      '0 2 * * *': ['generate-report'],
    },
  },
})
```

**Manual task execution (for testing/admin):**

```typescript
// server/api/admin/run-task.post.ts
export default defineEventHandler(async (event) => {
  const { task } = await readBody(event)
  const result = await runTask(task)
  return result
})
```

**Limitations:** Tasks run in the same process. For long-running work (video encoding, ML inference), use a dedicated job queue (BullMQ, Temporal, AWS SQS).

### Cron-Like Patterns

For simple recurring operations that don't need a full task system:

```typescript
// server/plugins/scheduler.ts
export default defineNitroPlugin((nitroApp) => {
  // Warm cache every 5 minutes
  if (import.meta.dev) return // Skip in dev

  setInterval(async () => {
    try {
      await $fetch('/api/cache-warm', { method: 'POST' })
      console.log('[scheduler] Cache warmed')
    } catch (error) {
      console.error('[scheduler] Cache warm failed:', error)
    }
  }, 5 * 60 * 1000)
})
```

### Email Sending Pattern

```typescript
// server/utils/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
}) {
  return resend.emails.send({
    from: 'noreply@myapp.com',
    ...options,
  })
}
```

```typescript
// server/api/auth/register.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Create user...
  const user = await createUser(body)

  // Send welcome email (fire and forget)
  sendEmail({
    to: user.email,
    subject: 'Welcome to MyApp',
    html: `<h1>Welcome, ${user.name}!</h1>`,
  }).catch(err => console.error('Email failed:', err))

  return { user }
})
```

## Walkthrough

1. **Add i18n:**
   ```bash
   npx nuxi module add i18n
   ```
   Configure two languages. Create locale files. Add a language switcher. Verify route prefixing.

2. **Add feature flags:**
   - Define flags in `runtimeConfig.public.features`
   - Create a middleware that gates `/beta` behind a flag
   - Toggle via env var, verify behavior changes

3. **Add WebSocket:**
   - Create `server/routes/_ws.ts` handler
   - Create `composables/useWebSocket.ts`
   - Build a simple chat: type message, broadcast to all connected clients

4. **Add rate limiting:**
   - Create server middleware limiting `/api/**` to 10 requests/minute
   - Test by hitting the API rapidly — verify 429 response
   - Check rate limit headers in response

## Gotchas

- **i18n with SSR: locale detection uses cookies/headers.** `localStorage` doesn't exist on the server. Use `useCookie` for persistent locale preference.
- **Feature flag stale state.** If you change a flag server-side, connected clients still have the old value until they refresh or re-fetch. Plan a refresh strategy (poll, WebSocket push, page reload prompt).
- **Multi-tenancy middleware order.** Resolve the tenant BEFORE auth middleware runs. Auth might need to validate against tenant-specific data.
- **WebSocket: deployment target matters.** Not all Nitro presets support WebSocket (AWS Lambda doesn't natively). Node.js server, Cloudflare Workers (Durable Objects), and Bun support it. Check before building.
- **Background tasks aren't suitable for long-running work.** They run in the main process. A task that takes 30 seconds blocks other things. Use external job queues for heavy work.
- **In-memory rate limiting breaks with multiple instances.** Each instance has its own counter. Use Redis or another shared store in production.
- **Cron in serverless: no persistent process.** Serverless functions spin up on demand — `setInterval` doesn't work. Use platform-specific schedulers (CloudWatch Events, Vercel Cron, Cloudflare Cron Triggers).
- **i18n route changes can break.** If you change the strategy (`prefix` → `prefix_except_default`), all existing URLs change. Plan redirects.

## Exercise

Build a multi-feature production app:

1. **i18n** — English + one additional language. Locale files with nested keys. Language switcher in header. Verify SSR renders correct language from cookie.

2. **Feature flags** — a "beta" page at `/beta` that's hidden unless `NUXT_PUBLIC_FEATURES_BETA_PAGE=true`. Show a "Coming Soon" badge on navigation for flagged features.

3. **WebSocket** — real-time notifications. When a user creates an item via API, broadcast a notification to all connected clients. Display a toast notification for connected users.

4. **Rate limiting** — 10 requests/minute on `/api/**`. Return proper `429` with `Retry-After` header. Test by scripting rapid requests.

5. **Scheduled task** — every 5 minutes, count total items in the database and log it. (Simulated: just log the count from in-memory store.)

## Further Reading

- [Nuxt Modules](https://nuxt.com/modules)
- [@nuxtjs/i18n](https://i18n.nuxtjs.org)
- [Nitro WebSocket](https://nitro.build/guide/websocket)
- [Nitro Tasks](https://nitro.build/guide/tasks)
- [crossws](https://crossws.unjs.io)
