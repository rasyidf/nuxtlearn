---
render_with_liquid: false
title: "Server Routes"
layout: chapter
nav_order: 6
parent: Home
starter: "05-server-routes"
official_docs:
  - https://nuxt.com/docs/4.x/getting-started/server
  - https://nuxt.com/docs/4.x/guide/directory-structure/server
---

# Server Routes

## TL;DR

Files in `server/api/` become API endpoints with the `/api` prefix. Files in `server/routes/` become routes at any path. The handler API is H3 — not Express, not Koa, not Fastify. Method suffixes (`.get.ts`, `.post.ts`) restrict HTTP methods. Server utils are auto-imported. Server middleware runs on every request. Nitro compiles your server into a standalone output deployable anywhere.

## Mental Model

```
server/
├── api/
│   ├── users.get.ts          → GET  /api/users
│   ├── users.post.ts         → POST /api/users
│   └── users/[id].get.ts     → GET  /api/users/:id
├── routes/
│   └── health.get.ts         → GET  /health
├── middleware/
│   └── log.ts                → Runs on EVERY request
└── utils/
    └── db.ts                 → Auto-imported in server context
```

Think of `server/` as a built-in backend that shares types with your frontend. You don't need a separate Express server, a separate repo, or a separate deployment. The server routes compile alongside your Vue app into one deployable artifact.

**The boundary is firm:** server code runs only on the server. Client code cannot import from `server/`. Communication happens through HTTP (`$fetch`/`useFetch`). But during SSR, when your Vue component calls `$fetch('/api/users')`, Nitro short-circuits — it calls the handler function directly without HTTP overhead.

### server/api/ vs server/routes/

**`server/api/`** — auto-prefixed with `/api`. Use for your REST endpoints:

```
server/api/users.ts         → /api/users (all methods)
server/api/users.get.ts     → GET /api/users
server/api/users.post.ts    → POST /api/users
server/api/users/[id].ts    → /api/users/:id (all methods)
```

**`server/routes/`** — maps directly to the URL path. Use for non-API server routes:

```
server/routes/health.ts     → /health
server/routes/sitemap.xml.ts → /sitemap.xml
server/routes/feed.rss.ts   → /feed.rss
```

**Method suffixes:** Append `.get`, `.post`, `.put`, `.patch`, `.delete` before `.ts` to restrict the HTTP method. Without a suffix, the handler responds to ALL methods.

```
server/api/users.get.ts     → only GET
server/api/users.post.ts    → only POST
server/api/users.ts         → GET, POST, PUT, DELETE, etc. (you check method manually)
```

### defineEventHandler

Every server route exports a handler:

```typescript
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  // Return value is auto-serialized to JSON
  return [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ]
})
```

The returned value becomes the response body. Objects/arrays serialize to JSON automatically. Strings return as text. You can also return `null` (204 No Content) or throw errors.

`event` is the H3 event object — it contains the request, response, and context. You don't use it directly for most things — you pass it to H3 utility functions.

### H3 Utilities

These are auto-imported in the server context. The most common ones:

```typescript
// server/api/users.post.ts
export default defineEventHandler(async (event) => {
  // Parse JSON request body
  const body = await readBody(event)

  // Get query parameters (?page=2&limit=10)
  const query = getQuery(event)

  // Get route params (from [id] in filename)
  const id = getRouterParam(event, 'id')

  // Set response status
  setResponseStatus(event, 201)

  // Set headers
  setHeader(event, 'X-Custom-Header', 'value')

  // Redirect
  await sendRedirect(event, '/new-location', 301)

  // Throw HTTP error
  throw createError({
    statusCode: 404,
    statusMessage: 'User not found',
  })
})
```

**Complete H3 utility reference:**

| Utility | Purpose |
|---------|---------|
| `readBody(event)` | Parse request body (POST/PUT/PATCH) |
| `getQuery(event)` | Parse query string |
| `getRouterParam(event, 'name')` | Get URL param from dynamic segment |
| `getRouterParams(event)` | Get all URL params |
| `getHeader(event, 'name')` | Read request header |
| `getHeaders(event)` | Read all request headers |
| `setHeader(event, 'name', 'value')` | Set response header |
| `setResponseStatus(event, code)` | Set HTTP status code |
| `sendRedirect(event, url, code?)` | Redirect response |
| `createError({ statusCode, message })` | Create HTTP error (throw it) |
| `getCookie(event, 'name')` | Read cookie |
| `setCookie(event, 'name', 'value', opts)` | Set cookie |
| `getRequestURL(event)` | Full request URL object |
| `isMethod(event, 'POST')` | Check HTTP method |

### Input Validation

Always validate input. Never trust the client:

```typescript
// server/api/users.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Manual validation
  if (!body?.name || typeof body.name !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'name is required and must be a string',
    })
  }

  if (body.name.length < 2 || body.name.length > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: 'name must be between 2 and 100 characters',
    })
  }

  // Create user...
  return { id: Date.now(), name: body.name }
})
```

For production, use a validation library like `zod`:

```typescript
// server/api/users.post.ts
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['user', 'admin']).default('user'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = createUserSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: result.error.flatten(),
    })
  }

  // result.data is typed and validated
  const user = result.data
  // ... create user
  return { id: Date.now(), ...user }
})
```

### Server Middleware

Files in `server/middleware/` run before every server request — API routes, page SSR, static assets, everything:

```typescript
// server/middleware/log.ts
export default defineEventHandler((event) => {
  const method = event.method
  const url = getRequestURL(event).pathname
  console.log(`[${method}] ${url}`)
  // Don't return anything — middleware that returns a value short-circuits the request
})
```

**Critical rule:** If a middleware returns a value, the request stops there — that value becomes the response. To let the request continue to the actual handler, return nothing (`undefined`).

```typescript
// server/middleware/auth.ts
export default defineEventHandler((event) => {
  // Only protect /api routes
  const url = getRequestURL(event).pathname
  if (!url.startsWith('/api')) return  // Skip non-API requests

  const token = getHeader(event, 'authorization')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Attach user to event context for downstream handlers
  event.context.user = verifyToken(token)
  // Return nothing — let the request continue
})
```

Middleware execution order is alphabetical by filename. Prefix with numbers to control order:

```
server/middleware/
├── 01.cors.ts       → runs first
├── 02.auth.ts       → runs second
└── 03.log.ts        → runs third
```

### defineCachedEventHandler

Cache expensive computations or external API calls:

```typescript
// server/api/stats.get.ts
export default defineCachedEventHandler(async (event) => {
  // This only runs once per 60 seconds
  const stats = await computeExpensiveStats()
  return stats
}, {
  maxAge: 60,          // Cache for 60 seconds
  staleMaxAge: 120,    // Serve stale for 120s while revalidating
  name: 'stats',       // Cache key name
  getKey: (event) => {
    // Custom cache key (e.g., per-user caching)
    return getQuery(event).region as string || 'global'
  },
})
```

Options:
- `maxAge` — seconds to keep in cache (fresh)
- `staleMaxAge` — additional seconds to serve stale while revalidating in background
- `swr` — shorthand for `staleMaxAge: maxAge` (stale-while-revalidate)
- `name` — custom cache name for debugging
- `getKey` — function to generate cache key from request (default: URL path)
- `varies` — headers that affect cache key (e.g., `['authorization']`)

### Server Utils (Auto-Imported)

Files in `server/utils/` are auto-imported across all server code:

```typescript
// server/utils/db.ts
interface Item {
  id: number
  title: string
  createdAt: Date
}

// Simple in-memory store (replace with real DB in production)
const items: Item[] = []

export function getItems(): Item[] {
  return items
}

export function getItem(id: number): Item | undefined {
  return items.find(item => item.id === id)
}

export function createItem(title: string): Item {
  const item = { id: Date.now(), title, createdAt: new Date() }
  items.push(item)
  return item
}

export function deleteItem(id: number): boolean {
  const index = items.findIndex(item => item.id === id)
  if (index === -1) return false
  items.splice(index, 1)
  return true
}
```

Now use it in any server route without imports:

```typescript
// server/api/items/index.get.ts
export default defineEventHandler(() => {
  return getItems()  // Auto-imported from server/utils/db.ts
})
```

This is where you put database connections, external API clients, shared validation schemas, and helper functions used across multiple routes.

### Database Connection Patterns

For real databases, initialize the connection in `server/utils/`:

```typescript
// server/utils/drizzle.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '~/server/database/schema'

export const db = drizzle(process.env.DATABASE_URL!, { schema })

// Now auto-imported in all server routes as `db`
```

```typescript
// server/api/users.get.ts
export default defineEventHandler(async () => {
  return db.select().from(schema.users).limit(50)
})
```

### Internal $fetch

Server routes can call other server routes:

```typescript
// server/api/dashboard.get.ts
export default defineEventHandler(async (event) => {
  // These are direct function calls during SSR — no HTTP overhead
  const [users, posts] = await Promise.all([
    $fetch('/api/users'),
    $fetch('/api/posts'),
  ])

  return {
    totalUsers: users.length,
    totalPosts: posts.length,
    recentPosts: posts.slice(0, 5),
  }
})
```

When called from within the server, `$fetch` to internal routes bypasses the network. It's a direct function call. Use this to compose complex endpoints from simpler ones.

### Nitro Storage

Nitro includes a built-in key-value storage API (powered by `unstorage`):

```typescript
// server/api/cache.get.ts
export default defineEventHandler(async (event) => {
  const storage = useStorage()

  // Read
  const value = await storage.getItem('mykey')

  // Write
  await storage.setItem('mykey', { hello: 'world' })

  // Check existence
  const exists = await storage.hasItem('mykey')

  // Delete
  await storage.removeItem('mykey')

  // List keys
  const keys = await storage.getKeys()

  return { value, exists, keys }
})
```

Configure storage drivers in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  nitro: {
    storage: {
      redis: { driver: 'redis', url: 'redis://localhost:6379' },
      fs: { driver: 'fs', base: './data' },
    },
  },
})
```

Then access mounted storage: `useStorage('redis')`, `useStorage('fs')`.

## Walkthrough

Open the `05-server-routes` starter:

```bash
cd starters/05-server-routes
npm install
npm run dev
```

1. **Explore server routes.** Check `server/api/` — note method suffixes in filenames.
2. **Test with curl.** `curl http://localhost:3000/api/items` — see the JSON response.
3. **Check server middleware.** Watch your terminal — every request is logged by `server/middleware/log.ts`.
4. **Test POST.** `curl -X POST -H "Content-Type: application/json" -d '{"title":"test"}' http://localhost:3000/api/items`
5. **Inspect server/utils.** See how `db.ts` is used across routes without imports.
6. **Test the UI.** The page uses `$fetch` for mutations and `refresh()` to update the list.

## Gotchas

- **H3 is NOT Express.** No `req.body` (use `readBody(event)`). No `res.json()` (just return the value). No `app.use()` middleware registration (use `server/middleware/` directory). Unlearn Express patterns.
- **Server routes cannot use Vue composables.** No `useRoute()`, `useState()`, `useFetch()` in server code. Those are Vue/Nuxt client-side composables. Server code uses H3 utilities and `useRuntimeConfig()`.
- **`readBody()` is async.** Must be awaited. Forgetting `await` gives you a Promise object instead of the body. TypeScript will warn you, but it's a common mistake.
- **Method suffixes are lowercase.** `.get.ts`, not `.GET.ts`. Case matters on Linux filesystems.
- **Server middleware runs on EVERYTHING.** Page SSR requests, API calls, static assets — all hit your middleware. Filter by path if you only want to intercept API routes.
- **Don't import from `server/` in client code.** The build system keeps them separate. Importing a server util in a `.vue` file will fail at build time or leak server code to the client.
- **Returning from middleware stops the request.** If your middleware accidentally returns a value (even `''` or `0`), that becomes the response. Only `throw` errors or return `undefined` (implicit or explicit) to pass through.
- **Dynamic params use filename brackets.** `server/api/users/[id].get.ts` → access with `getRouterParam(event, 'id')`. Same bracket syntax as pages.
- **In-memory data resets on restart.** The in-memory array pattern in the starter is for learning only. In production, use a database or Nitro storage with a persistent driver.
- **`createError` vs `throw new Error`.** Always use `createError` for HTTP errors — it sets proper status codes and serializes cleanly. `throw new Error('oops')` results in a 500 with a generic message.

## Exercise

Build a CRUD API for a "notes" resource:

1. **GET `/api/notes`** — return all notes, support `?search=term` query filter
2. **GET `/api/notes/[id]`** — return single note, 404 if not found
3. **POST `/api/notes`** — create note, validate: `title` (required, 1-200 chars) and `content` (optional, max 5000 chars)
4. **PUT `/api/notes/[id]`** — update note, validate same as create, 404 if not found
5. **DELETE `/api/notes/[id]`** — delete note, 404 if not found

6. Store in-memory (server/utils/notes-db.ts, auto-imported)
7. Add server middleware that logs `[METHOD] /path — Xms` (include response time)
8. Add `defineCachedEventHandler` to the GET list endpoint with 10-second cache
9. Build a simple UI page that uses the API (useFetch for list, $fetch for mutations)

## Further Reading

- [Server Guide](https://nuxt.com/docs/4.x/getting-started/server)
- [Server Directory](https://nuxt.com/docs/4.x/guide/directory-structure/server)
- [H3 Documentation](https://h3.unjs.io)
- [Nitro Routing](https://nitro.build/guide/routing)
- [Nitro Storage](https://nitro.build/guide/storage)
- [Unstorage Drivers](https://unstorage.unjs.io)
