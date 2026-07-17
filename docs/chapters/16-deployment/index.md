---
title: "Deployment"
layout: chapter
nav_order: 17
parent: Home
starter: "16-deployment"
official_docs:
  - https://nuxt.com/docs/4.x/getting-started/deployment
  - https://nuxt.com/deploy
---

# Deployment

## TL;DR

Nuxt deploys anywhere via Nitro presets. Set `NITRO_PRESET` (or configure in `nuxt.config.ts`) and Nitro compiles your app for that target: Node.js server, Vercel serverless, Cloudflare Workers, AWS Lambda, Docker, etc. Same code, different output. Environment variables split into build-time (baked in) and runtime (injected at startup without rebuilding).

## Mental Model

```
Source Code → nuxt build (with preset) → .output/ → Deploy
```

The `.output/` directory is self-contained:
- `.output/server/` — compiled server (Nitro, entry point: `index.mjs`)
- `.output/public/` — static assets + prerendered HTML

For the Node.js preset: `node .output/server/index.mjs` starts the production server. Nothing else needed — no `node_modules` required at runtime (dependencies are bundled).

### Preset Overview

| Preset | Target | Server Required | Cold Start |
|--------|--------|----------------|-----------|
| `node-server` | Node.js (VM, Docker) | ✓ | None |
| `vercel` | Vercel Serverless | Auto-managed | ~200ms |
| `vercel-edge` | Vercel Edge Functions | Auto-managed | ~50ms |
| `netlify` | Netlify Functions | Auto-managed | ~200ms |
| `cloudflare-pages` | Cloudflare Workers | Auto-managed | ~20ms |
| `aws-lambda` | AWS Lambda | Auto-managed | ~300ms |
| `deno-server` | Deno runtime | ✓ | None |
| `bun` | Bun runtime | ✓ | None |
| `static` | Static hosting (S3, etc.) | ✗ | None |

Set the preset:

```bash
# Via environment variable (recommended for CI)
NITRO_PRESET=node-server npx nuxi build

# Or in config
export default defineNuxtConfig({
  nitro: { preset: 'node-server' },
})
```

**Auto-detection:** On Vercel, Netlify, and Cloudflare, Nitro auto-detects the platform and selects the correct preset. You usually don't need to set it explicitly for these platforms.

### Node.js Server Deployment

The default and most flexible option:

```bash
# Build
npx nuxi build

# Preview locally
npx nuxi preview

# Production start
node .output/server/index.mjs
```

The server listens on `PORT` (default: 3000) and `HOST` (default: `0.0.0.0`):

```bash
PORT=8080 HOST=0.0.0.0 node .output/server/index.mjs
```

**Process management with PM2:**

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'my-nuxt-app',
    script: '.output/server/index.mjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      PORT: 3000,
      NUXT_PUBLIC_API_BASE: 'https://api.production.com',
    },
  }],
}
```

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # Auto-start on reboot
```

### Docker Deployment

Multi-stage Dockerfile for minimal production image:

```dockerfile
# Build stage
FROM node:20-slim AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim AS production
WORKDIR /app

# Copy only the self-contained output
COPY --from=build /app/.output .output

# Set environment
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start
CMD ["node", ".output/server/index.mjs"]
```

**Key points:**
- The runtime stage has NO `node_modules` — everything is bundled in `.output/`
- Image size: ~150MB (node:20-slim base) vs ~1GB (full node image with source)
- `.output/` is fully self-contained — copy it anywhere

```bash
docker build -t my-nuxt-app .
docker run -p 3000:3000 \
  -e NUXT_PUBLIC_API_BASE=https://api.prod.com \
  -e NUXT_API_SECRET=s3cr3t \
  my-nuxt-app
```

### Environment Variables

Two categories:

**Build-time variables** — used during `nuxt build`, baked into the output:
- `NUXT_PUBLIC_*` values used in config but NOT in `runtimeConfig` are build-time
- Vite's `import.meta.env.VITE_*` are build-time
- Changing these requires a rebuild

**Runtime variables** — override `runtimeConfig` at startup:
- `NUXT_*` variables matching the runtimeConfig structure
- Read when the server starts, no rebuild needed
- The primary way to configure per-environment

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    apiSecret: '',                    // → NUXT_API_SECRET
    database: { url: '' },            // → NUXT_DATABASE_URL
    public: {
      apiBase: 'http://localhost:3000', // → NUXT_PUBLIC_API_BASE
      appVersion: '1.0.0',             // → NUXT_PUBLIC_APP_VERSION
    },
  },
})
```

```bash
# Production deployment
NUXT_API_SECRET=prod-secret-key \
NUXT_DATABASE_URL=postgres://prod:5432/app \
NUXT_PUBLIC_API_BASE=https://api.myapp.com \
node .output/server/index.mjs
```

**`.env` for local development:**

```bash
# .env (loaded automatically by Nuxt in dev mode)
NUXT_API_SECRET=dev-secret
NUXT_PUBLIC_API_BASE=http://localhost:3000/api
```

Note: `.env` is loaded in `nuxi dev` and `nuxi build` but NOT at runtime in production. For production, set env vars through your platform (Docker, Vercel dashboard, systemd environment, etc.).

### Vercel / Netlify / Cloudflare

**Vercel** — zero-config:

```bash
# Just push to git — Vercel auto-detects Nuxt
git push origin main
```

Or via CLI:

```bash
npx vercel
```

Vercel auto-detects the Nuxt framework, selects the `vercel` preset, and deploys. Set env vars in the Vercel dashboard.

**Cloudflare Pages:**

```bash
npx nuxi build --preset cloudflare-pages
npx wrangler pages deploy .output/public
```

```toml
# wrangler.toml
name = "my-nuxt-app"
compatibility_date = "2024-01-01"

[site]
bucket = ".output/public"
```

**Edge vs Node.js tradeoffs:**

| | Node.js (Serverless) | Edge (Workers) |
|---|---|---|
| Cold start | ~200-300ms | ~20-50ms |
| Node APIs | Full | Limited (no `fs`, no native modules) |
| npm compat | Excellent | Limited (some packages fail) |
| Memory | Up to 3GB | 128MB |
| Execution time | 5-60 minutes | 30 seconds |
| Best for | Complex apps, DB access | Simple APIs, auth, redirects |

### Health Check Endpoint

Every production app needs a health check:

```typescript
// server/api/health.get.ts
export default defineEventHandler(async (event) => {
  const checks: Record<string, 'ok' | 'error'> = {}

  // Check database connectivity
  try {
    await db.execute('SELECT 1')
    checks.database = 'ok'
  } catch {
    checks.database = 'error'
  }

  // Check external service
  try {
    await $fetch('https://api.external.com/status', { timeout: 2000 })
    checks.external = 'ok'
  } catch {
    checks.external = 'error'
  }

  const healthy = Object.values(checks).every(v => v === 'ok')

  if (!healthy) {
    setResponseStatus(event, 503)
  }

  return {
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
    version: useRuntimeConfig().public.appVersion,
  }
})
```

Load balancers, Kubernetes, and Docker use this endpoint to determine if the instance should receive traffic.

### Graceful Shutdown

Nitro handles `SIGTERM` gracefully by default — it stops accepting new connections and lets in-flight requests complete. For custom cleanup:

```typescript
// plugins/shutdown.server.ts
export default defineNuxtPlugin((nuxtApp) => {
  // Custom cleanup on shutdown
  nuxtApp.hook('close', async () => {
    console.log('Shutting down...')
    await closeDbConnections()
    await flushLogs()
  })
})
```

In Docker/Kubernetes, send `SIGTERM` and allow a grace period:

```yaml
# Kubernetes
terminationGracePeriodSeconds: 30
```

```dockerfile
# Docker — proper signal handling
STOPSIGNAL SIGTERM
```

### Build Output Structure

```
.output/
├── server/
│   ├── index.mjs          ← Entry point
│   ├── chunks/            ← Server code chunks
│   └── package.json       ← Minimal (type: module)
├── public/
│   ├── _nuxt/             ← Client JS/CSS chunks (hashed)
│   ├── index.html         ← Prerendered pages (if any)
│   └── favicon.ico        ← Static assets
└── nitro.json             ← Build metadata
```

The entire `.output/` directory is your deployable artifact. Copy it to any server with Node.js and run.

## Walkthrough

1. **Build with node-server preset:**
   ```bash
   npx nuxi build
   ls -la .output/
   ```

2. **Run production locally:**
   ```bash
   NUXT_PUBLIC_API_BASE=http://localhost:3000/api node .output/server/index.mjs
   ```

3. **Create a Dockerfile** — multi-stage build as shown above. Build and run the container.

4. **Test env var override:**
   ```bash
   # Change a public value without rebuilding
   NUXT_PUBLIC_APP_VERSION=2.0.0 node .output/server/index.mjs
   # Verify the change in the running app
   ```

5. **Add health check** — create `/api/health`. Test it: `curl http://localhost:3000/api/health`.

## Gotchas

- **`NITRO_PRESET` must match your target.** Building with `node-server` and deploying to Cloudflare Workers will fail. The preset determines the output format.
- **Runtime config vars must follow the naming convention.** `NUXT_PUBLIC_API_BASE` maps to `runtimeConfig.public.apiBase`. The path is SCREAMING_SNAKE_CASE. Nested objects use underscore separators.
- **`public/` assets are served directly.** Don't put secrets in `public/`. Files there are accessible to anyone at the URL path.
- **Cloudflare Workers have no Node.js APIs.** `fs`, `path`, `crypto` (partially), native addons — none available. Many npm packages fail. Test on the target platform early.
- **Docker: `.output/` is self-contained.** Don't copy `node_modules` to the runtime stage — it's unnecessary and bloats the image. Everything is bundled.
- **Build-time env vars are permanent.** If you set `NUXT_PUBLIC_API_BASE=http://staging.api.com` during build, it's baked in. Runtime override works for `runtimeConfig` values only — not for all env vars.
- **`.env` is NOT loaded in production.** It's a dev convenience. In production, set env vars through your platform's configuration (Docker env, Vercel settings, systemd EnvironmentFile, etc.).
- **Cold starts in serverless.** First request after idle period takes longer (Lambda: ~300ms, Workers: ~20ms). Keep functions warm for latency-sensitive applications, or use edge runtime.
- **Multiple instances don't share memory.** In-memory caches, rate limiting state, and WebSocket connections are per-instance. Use external stores (Redis, database) for shared state in clustered deployments.

## Exercise

1. **Build for production:**
   ```bash
   NITRO_PRESET=node-server npx nuxi build
   ```

2. **Create a Dockerfile** using the multi-stage pattern. Build and run it.

3. **Configure environment:**
   - Define `runtimeConfig` with: `apiSecret` (private), `public.apiBase`, `public.appVersion`
   - Override all three via Docker env vars at runtime
   - Verify the private key is NOT accessible from the client

4. **Add health check:**
   - `GET /api/health` returns `{ status, timestamp, version }`
   - Returns 503 if a simulated dependency check fails

5. **Document your env vars:**
   - Create a table listing each var, whether it's build-time or runtime, and its purpose
   - This table should live in your README or deployment documentation

## Further Reading

- [Deployment Guide](https://nuxt.com/docs/4.x/getting-started/deployment)
- [Deploy Targets](https://nuxt.com/deploy)
- [Nitro Deployment](https://nitro.build/deploy)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
