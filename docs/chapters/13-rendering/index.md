---
render_with_liquid: false
title: "Rendering Modes"
layout: chapter
nav_order: 14
parent: Home
starter: "13-rendering"
official_docs:
  - https://nuxt.com/docs/4.x/guide/concepts/rendering
  - https://nuxt.com/docs/4.x/getting-started/prerendering
---

# Rendering Modes

## TL;DR

Nuxt supports hybrid rendering: mix SSR, SPA, prerendered, and ISR routes in a single app via `routeRules`. Each route gets the optimal rendering strategy — static pages are prerendered at build, dashboards are SPA, product pages use ISR for cached freshness. Configure in `nuxt.config.ts`, deploy to any target.

## Mental Model

Think of `routeRules` as a per-route rendering policy:

```typescript
routeRules: {
  '/':           { prerender: true },       // Static HTML at build time
  '/about':      { prerender: true },       // Static HTML at build time
  '/blog/**':    { isr: 3600 },             // Cached SSR, revalidate every hour
  '/app/**':     { ssr: false },            // SPA mode (no server rendering)
  '/api/**':     { cors: true },            // API: add CORS headers
  '/admin/**':   { ssr: false, appMiddleware: 'auth' },
}
```

One app. Multiple rendering strategies. Zero compromise. The marketing team gets SEO-friendly static pages. The dashboard team gets instant client-only navigation. The blog gets fast cached pages that stay fresh.

### Universal Rendering (Default)

Nuxt's default: server renders HTML on the first request, client hydrates and takes over for subsequent navigations.

```
First visit:  Server → HTML (with data) → Client hydrates → Interactive
Navigation:   Client-side → JS renders → No server round-trip
```

This gives you:
- Fast First Contentful Paint (HTML arrives immediately)
- SEO (crawlers see fully rendered content)
- Full interactivity after hydration
- Client-side navigation for subsequent pages

You don't need to configure anything — this is active by default.

### routeRules Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // Prerender: generate static HTML at build time
    '/': { prerender: true },
    '/about': { prerender: true },
    '/pricing': { prerender: true },

    // ISR: cached SSR with background revalidation
    '/blog/**': { isr: 3600 },         // Cache 1 hour
    '/products/**': { isr: 600 },       // Cache 10 minutes

    // SWR: stale-while-revalidate (similar to ISR)
    '/docs/**': { swr: 86400 },         // Serve stale for 24h while refreshing

    // SPA: client-only rendering (no SSR)
    '/app/**': { ssr: false },
    '/admin/**': { ssr: false },

    // Headers: custom response headers
    '/api/**': {
      cors: true,
      headers: { 'Cache-Control': 'max-age=60' },
    },

    // Redirects
    '/old-path': { redirect: '/new-path' },
    '/legacy/**': { redirect: { to: '/modern/**', statusCode: 301 } },
  },
})
```

**Pattern matching:**
- `/path` — exact match
- `/path/**` — matches all nested paths (recursive)
- `/path/*` — matches one segment only

### Prerendering

Static HTML generated at build time. No server needed to serve these pages:

```typescript
routeRules: {
  '/': { prerender: true },
  '/about': { prerender: true },
  '/blog/my-post': { prerender: true },
}
```

**Automatic crawling:** During `nuxt generate`, Nuxt crawls links from prerendered pages and prerenders those too. Starting from `/`, it finds links to `/about`, `/blog`, etc. and generates them all.

**Manual route list:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/feed.rss'],
      crawlLinks: true,  // Follow links from prerendered pages
    },
  },
})
```

**`nuxi generate` vs `nuxi build`:**
- `nuxi build` — builds the app (SSR server + client). Prerendered routes are generated during build.
- `nuxi generate` — same as build but prerendering is the primary goal. Sets `nitro.static: true` for routes without `ssr: false`.

Use `nuxi generate` for fully static sites. Use `nuxi build` for hybrid apps (mix of static + server-rendered routes).

### ISR (Incremental Static Regeneration)

The best of both worlds: serve cached HTML instantly, revalidate in the background:

```typescript
routeRules: {
  '/blog/**': { isr: 3600 },  // Cache for 1 hour (3600 seconds)
}
```

**How ISR works:**

```
Request 1 (cold):
  → Server renders → Caches HTML → Returns to client
  
Request 2 (within 3600s):
  → Returns cached HTML instantly (no rendering)
  
Request 3 (after 3600s):
  → Returns STALE cached HTML instantly
  → Triggers background re-render
  → Next request gets fresh cached version
```

This means:
- First visitor gets SSR (slightly slower)
- All subsequent visitors get cached response (fast, like static)
- After TTL expires, the cache is refreshed in the background
- No visitor ever waits for a fresh render (stale served while regenerating)

**ISR requires a running server.** You can't use ISR with pure static hosting (Netlify static, S3). You need a deployment with a server runtime (Node.js, Edge, serverless).

### SWR (Stale-While-Revalidate)

Similar to ISR but with different caching semantics:

```typescript
routeRules: {
  '/docs/**': { swr: true },         // Cache indefinitely, revalidate on every request
  '/news/**': { swr: 600 },          // Cache 10 minutes, then revalidate
}
```

- `swr: true` — always serve cached, revalidate every time (eventual consistency)
- `swr: <seconds>` — serve cached for N seconds, then trigger revalidation

The difference from ISR is subtle: ISR has a hard TTL after which it must revalidate. SWR with `true` always revalidates but never blocks on it.

### SPA Mode (ssr: false)

Disable server-side rendering for specific routes:

```typescript
routeRules: {
  '/app/**': { ssr: false },     // Entire app section is SPA
  '/admin/**': { ssr: false },   // Admin panel is SPA
}
```

**What this means:**
- Server sends an empty HTML shell (no pre-rendered content)
- Client JavaScript renders the entire page
- No SEO for these pages (crawlers see empty HTML)
- Faster server response (no rendering work)
- Good for authenticated sections, dashboards, internal tools

**Global SPA mode** (disable SSR entirely):

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,  // Entire app is SPA
})
```

### Rendering Decision Framework

Use this flowchart:

```
Does the page need SEO?
├── No → ssr: false (SPA)
│         Good for: admin panels, dashboards, internal tools
└── Yes
    ├── Is content truly static (changes only on deploy)?
    │   └── Yes → prerender: true
    │             Good for: marketing pages, about, pricing, docs
    └── No
        ├── Is real-time freshness critical?
        │   └── Yes → default SSR (no rule needed)
        │             Good for: personalized content, real-time data
        └── No
            └── How often does content change?
                ├── Hourly → isr: 3600
                ├── Daily → isr: 86400
                └── Weekly → isr: 604800 (or just prerender)
                  Good for: blog posts, product pages, news articles
```

### Route-Level Cache Headers

Control CDN and browser caching:

```typescript
routeRules: {
  // API responses: cache for 60 seconds
  '/api/products/**': {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=600' },
  },

  // Static assets: cache aggressively
  '/_nuxt/**': {
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
  },

  // No-cache for dynamic pages
  '/dashboard/**': {
    headers: { 'Cache-Control': 'no-store' },
    ssr: false,
  },
}
```

### CORS Configuration

```typescript
routeRules: {
  '/api/**': {
    cors: true,  // Adds Access-Control-Allow-Origin: *
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
}
```

### Verifying Rendering Modes

After deploying, verify each mode works:

```bash
# Prerendered: check for static HTML file in output
ls .output/public/about/index.html

# SSR: check response headers (no cache, full HTML)
curl -I http://localhost:3000/dashboard
# Content-Type: text/html, no strong caching

# ISR: check X-Nitro-Prerender header
curl -I http://localhost:3000/blog/my-post
# Look for cache-related headers

# SPA: view source shows empty body
curl http://localhost:3000/app/
# HTML body is minimal (just the mount point)
```

## Walkthrough

1. **Set up routeRules with mixed modes:**
   ```typescript
   routeRules: {
     '/': { prerender: true },
     '/about': { prerender: true },
     '/blog/**': { isr: 3600 },
     '/app/**': { ssr: false },
   }
   ```

2. **Build and inspect output:**
   ```bash
   npx nuxi build
   ls .output/public/  # See prerendered HTML files
   ```

3. **Run preview and test:**
   ```bash
   npx nuxi preview
   # Visit / — view source shows full HTML (prerendered)
   # Visit /app/ — view source shows empty shell (SPA)
   # Visit /blog/post — first load is SSR, subsequent are cached
   ```

4. **Check response headers** for each route — verify caching behavior.

5. **Add a new blog post** — verify ISR serves stale then refreshes.

## Gotchas

- **`ssr: false` is NOT the same as `<ClientOnly>`.** `ssr: false` on a route means the ENTIRE page is client-rendered (empty HTML shell). `<ClientOnly>` wraps a specific component within an otherwise SSR-rendered page.
- **ISR requires a server runtime.** Pure static hosting (S3, GitHub Pages) can't do ISR. You need Node.js, edge functions, or serverless with caching.
- **Prerendered pages are build-time snapshots.** They don't reflect runtime data changes. If your blog post database updates, prerendered pages show stale content until the next build. Use ISR if freshness matters.
- **`routeRules` patterns are glob-based.** `/blog/**` matches `/blog/a/b/c` (recursive). `/blog/*` matches only `/blog/a` (one level). Be specific.
- **Hybrid mode still needs a server.** If ANY route uses SSR or ISR, you need a server runtime. Only a fully prerendered app (`nuxi generate` with all routes static) can deploy without a server.
- **SPA routes have no SEO.** Search engines see an empty HTML shell. Don't use `ssr: false` for public-facing pages that need indexing.
- **ISR cache is per-instance.** If you have multiple server instances (horizontal scaling), each has its own cache. Use a shared cache (Redis, CDN) for consistent behavior across instances.
- **`nuxi generate` prerendering follows links.** If a prerendered page links to a dynamic page, Nuxt will try to prerender it too. Use `nitro.prerender.ignore` to exclude patterns you don't want prerendered.
- **First ISR request is slow.** The first visitor to an uncached ISR page gets the full SSR response time. Subsequent visitors get the fast cached version. Warm your cache with a crawler if this matters.

## Exercise

Configure a hybrid app:

1. **Prerender:** `/`, `/about`, `/pricing` — verify HTML files exist in `.output/public/`
2. **ISR:** `/blog/**` with 1-hour cache — build, visit a blog page, refresh — second load should be from cache
3. **SPA:** `/app/**` — verify empty HTML shell in view-source
4. **Headers:** `/api/**` — add CORS + `Cache-Control: max-age=60`
5. **Redirect:** `/old-blog/**` → `/blog/**` with 301 status
6. **Verify:** use `curl -I` to check response headers for each route category. Confirm prerendered routes serve instantly, ISR routes show caching headers, and SPA routes have no pre-rendered content.

## Further Reading

- [Rendering Concepts](https://nuxt.com/docs/4.x/guide/concepts/rendering)
- [Prerendering Guide](https://nuxt.com/docs/4.x/getting-started/prerendering)
- [Route Rules](https://nuxt.com/docs/4.x/guide/concepts/rendering#route-rules)
- [Nitro Caching](https://nitro.build/guide/cache)
- [Hybrid Rendering](https://nuxt.com/docs/4.x/guide/concepts/rendering#hybrid-rendering)
