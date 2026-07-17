# Changes from 03-layouts

## What was added

- **`server/api/` directory** — Nitro server routes that serve as the backend API
- **`useFetch`** — SSR-friendly data fetching (blocks navigation until data loads)
- **Lazy fetching** — `useFetch('/url', { lazy: true })` renders page immediately, loads data client-side
- **`status` reactive ref** — tracks `'idle' | 'pending' | 'success' | 'error'`

## Key files

| File | Purpose |
|------|---------|
| `server/api/posts.get.ts` | GET `/api/posts` — returns mock post list |
| `server/api/posts/[id].get.ts` | GET `/api/posts/:id` — returns single post |
| `pages/index.vue` | Demonstrates `await useFetch()` (blocking) |
| `pages/lazy.vue` | Demonstrates `useFetch({ lazy: true })` (non-blocking) |

## Key concepts

- `useFetch` deduplicates requests between server and client (no double-fetch)
- The `.get.ts` suffix restricts the route to GET requests only
- Server routes run in Nitro (separate from Vue) — no access to Vue composables
