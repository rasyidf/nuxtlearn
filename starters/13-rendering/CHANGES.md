# Chapter 13: Rendering Modes

## What Was Added

This starter demonstrates **hybrid rendering** — mixing multiple rendering strategies in a single Nuxt application using `routeRules`.

## Key Concepts

### routeRules (nuxt.config.ts)

```typescript
routeRules: {
  '/': { prerender: true },        // Static HTML at build time
  '/about': { prerender: true },   // Static HTML at build time
  '/blog/**': { isr: 60 },         // Cached 60s, then regenerated
  '/app/**': { ssr: false },       // Client-only SPA rendering
  '/api/**': { cors: true, headers: { 'Cache-Control': 'max-age=60' } },
}
```

### Prerender (`prerender: true`)

- Pages are rendered to static HTML during `nuxt generate` or `nuxt build`
- Served directly from CDN/filesystem — fastest possible TTFB
- Content is frozen at build time; changes require a rebuild
- Used for: `/`, `/about`

### ISR — Incremental Static Regeneration (`isr: 60`)

- First request renders the page and caches it
- Subsequent requests within 60s get the cached version instantly
- After TTL expires, the next request triggers background regeneration
- Best of both worlds: static speed + fresh content
- Used for: `/blog/**`

### SPA Mode (`ssr: false`)

- Server sends an empty HTML shell (no server-side rendering)
- Client JavaScript renders the entire page
- No SEO for these pages (search engines see empty HTML)
- Ideal for authenticated dashboards, admin panels
- Used for: `/app/**`

### Cache Headers

- Applied to API routes via `headers` in routeRules
- `cors: true` adds CORS headers automatically
- Used for: `/api/**`

## How to Verify Each Mode

### Prerendered Pages (/, /about)

1. Run `npx nuxt generate`
2. Check `.output/public/index.html` — contains fully rendered HTML
3. The timestamp is baked in and never changes

### ISR Pages (/blog/*)

1. Run `npx nuxt build && npx nuxt preview`
2. Visit `/blog` — note the "rendered at" timestamp
3. Refresh immediately — same timestamp (cached)
4. Wait 60+ seconds, refresh — new timestamp (regenerated)

### SPA Pages (/app/*)

1. Visit `/app` in the browser
2. Right-click → View Page Source
3. The page content is NOT in the HTML source (rendered by JS)
4. The clock updates every second (client-side)
5. Navigate to `/app/settings` — instant, no server request

### API Cache Headers

```bash
curl -I http://localhost:3000/api/time
# Look for: Cache-Control: max-age=60
# Look for: Access-Control-Allow-Origin: *
```

## Files

| File | Purpose |
|------|---------|
| `nuxt.config.ts` | routeRules configuration |
| `layouts/default.vue` | Nav showing rendering mode per route |
| `pages/index.vue` | Prerendered home page |
| `pages/about.vue` | Prerendered about page |
| `pages/blog/index.vue` | ISR blog listing |
| `pages/blog/[id].vue` | ISR individual post |
| `pages/app/index.vue` | SPA dashboard with live clock |
| `pages/app/settings.vue` | SPA settings (client navigation) |
| `server/api/posts.get.ts` | API: returns posts + timestamp |
| `server/api/time.get.ts` | API: returns server time |

## Further Reading

- [Nuxt Rendering Modes](https://nuxt.com/docs/guide/concepts/rendering)
- [Route Rules](https://nuxt.com/docs/api/nuxt-config#routerules)
- [Hybrid Rendering](https://nuxt.com/docs/guide/concepts/rendering#hybrid-rendering)
- [Prerendering](https://nuxt.com/docs/getting-started/prerendering)
