# 04 — Data Fetching

Data fetching patterns with `useFetch`, lazy loading, and server API routes.

## What to explore

- `useFetch` blocks rendering until data is ready (SSR-friendly)
- `useFetch('/url', { lazy: true })` renders immediately, fetches client-side
- Server routes in `server/api/` are auto-registered as API endpoints
- Check Network tab: on initial load, no client-side fetch (data comes from SSR payload)

## Run

```bash
npm install
npm run dev
```

Visit `/` (blocking fetch) and `/lazy` (non-blocking fetch).
