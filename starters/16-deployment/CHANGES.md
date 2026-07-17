# Chapter 16: Deployment

## What's New

This starter demonstrates production deployment patterns for Nuxt applications.

### Nitro Presets

Nuxt uses [Nitro](https://nitro.unjs.io/) as its server engine. Nitro supports multiple deployment targets via **presets**:

- `node-server` (default) — standalone Node.js server
- `vercel` — Vercel serverless/edge
- `netlify` — Netlify Functions
- `cloudflare-pages` — Cloudflare Pages with Workers
- `aws-lambda` — AWS Lambda
- `deno-server` — Deno runtime
- `bun` — Bun runtime

Set via `nuxt.config.ts`:
```ts
export default defineNuxtConfig({
  nitro: {
    preset: 'node-server' // or auto-detected from environment
  }
})
```

Or via environment variable: `NITRO_PRESET=vercel nuxt build`

### Docker Multi-Stage Build

The `Dockerfile` uses a two-stage approach:

1. **Build stage** — installs all deps, runs `nuxt build`, produces `.output/`
2. **Production stage** — copies only `.output/`, no source code or dev deps

Benefits:
- Smaller image (~150MB vs ~800MB)
- No source code in production image
- No devDependencies in production image
- Reproducible builds

### Environment Variables: Build-time vs Runtime

| Type | When Read | Can Change Without Rebuild? |
|------|-----------|---------------------------|
| Build-time | During `nuxt build` | ❌ No |
| Runtime | When server starts | ✅ Yes |

**Runtime config** (`runtimeConfig` in `nuxt.config.ts`) is the runtime approach — values are read from env vars on each server start.

### The `NUXT_` Convention

Nuxt automatically maps env vars to runtime config:

```
NUXT_API_SECRET          → runtimeConfig.apiSecret         (server only)
NUXT_PUBLIC_APP_VERSION  → runtimeConfig.public.appVersion (client + server)
NUXT_PUBLIC_API_BASE     → runtimeConfig.public.apiBase    (client + server)
```

Rules:
- `NUXT_` prefix is mandatory
- `PUBLIC_` exposes to client bundle
- camelCase keys → UPPER_SNAKE_CASE env vars
- Nested keys separated by `_`

### Health Check Endpoint

`/api/health` returns server status, used by:
- Docker `HEALTHCHECK` instruction
- Load balancer health probes
- Kubernetes readiness/liveness probes
- Monitoring systems

### `.output/` Structure

After `nuxt build`, the `.output/` directory contains everything needed to run:

```
.output/
├── server/
│   ├── index.mjs          ← Entry point
│   ├── chunks/            ← Server code chunks
│   └── node_modules/      ← Production-only deps (tree-shaken)
├── public/
│   ├── _nuxt/             ← Client JS/CSS bundles
│   └── ...                ← Static assets
└── nitro.json             ← Server metadata
```

Key points:
- Self-contained — no external `node_modules` needed
- Portable — copy to any Node.js 18+ environment
- Single entry point — `node .output/server/index.mjs`

## How to Use

### Local development
```bash
npm install
npm run dev
```

### Build and preview
```bash
npm run build
npm run preview
# or directly: node .output/server/index.mjs
```

### With env overrides
```bash
NUXT_PUBLIC_APP_VERSION=2.0.0 NUXT_API_SECRET=secret123 node .output/server/index.mjs
```

### Docker
```bash
docker build -t nuxtlearn-16 .
docker run -p 3000:3000 -e NUXT_API_SECRET=prod-secret nuxtlearn-16
```
