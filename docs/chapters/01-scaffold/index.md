---
render_with_liquid: false
title: "Scaffold & Config"
layout: chapter
nav_order: 2
parent: Home
starter: "01-scaffold"
official_docs:
  - https://nuxt.com/docs/4.x/getting-started/installation
  - https://nuxt.com/docs/4.x/getting-started/configuration
---

# Scaffold & Config

## TL;DR

`nuxi init` creates a Nuxt project with sensible defaults. `nuxt.config.ts` is the single source of truth for build-time and runtime configuration. Getting TypeScript strict mode and devtools set up early saves hours of debugging later. Understand the split between build-time config (locked at compile) and runtime config (injectable per environment).

## Mental Model

`nuxt.config.ts` governs two worlds:

1. **Build-time config** — modules, Vite settings, Nitro presets, route rules. These affect the compilation output. Once you run `nuxt build`, they're baked in. Changing them requires a rebuild.
2. **Runtime config** — values available at request time via `useRuntimeConfig()`. These can differ per environment (dev vs staging vs prod) without rebuilding. Environment variables override them at deploy time.

This split is fundamental. If you put an API URL in `modules`, you must rebuild to change it. If you put it in `runtimeConfig.public`, you can override it with an env var at runtime.

### nuxi CLI Walkthrough

```bash
npx nuxi init my-app
```

This scaffolds:

```
my-app/
├── app.vue           → Entry component (replaces pages/ if you don't need routing)
├── nuxt.config.ts    → Framework config
├── tsconfig.json     → Extends .nuxt/tsconfig.json
├── package.json      → Deps: nuxt, vue, vue-router
├── .gitignore        → Ignores .nuxt/, node_modules/, .output/
└── README.md
```

Other useful `nuxi` commands you'll use daily:

| Command | Purpose |
|---------|---------|
| `nuxi dev` | Start dev server with HMR |
| `nuxi build` | Production build |
| `nuxi preview` | Preview production build locally |
| `nuxi prepare` | Generate `.nuxt/` types without starting server |
| `nuxi add page <name>` | Scaffold a new page |
| `nuxi add composable <name>` | Scaffold a composable |
| `nuxi add api <name>` | Scaffold a server API route |
| `nuxi module add <name>` | Install and register a Nuxt module |
| `nuxi cleanup` | Delete `.nuxt/`, `node_modules/.cache`, `.output/` |
| `nuxi analyze` | Visualize production bundle |

### nuxt.config.ts Anatomy

```typescript
export default defineNuxtConfig({
  // Build-time: which modules to load
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  // Runtime: values accessible via useRuntimeConfig()
  runtimeConfig: {
    // Private — server only (never sent to client)
    apiSecret: '',
    database: { host: 'localhost', port: 5432 },

    // Public — available on both server and client
    public: {
      apiBase: 'http://localhost:3000/api',
      appName: 'My App',
    },
  },

  // App-level settings
  app: {
    head: {
      title: 'My App',
      meta: [{ name: 'description', content: 'Dense Nuxt app' }],
    },
  },

  // Vite config passthrough
  vite: {
    css: { preprocessorOptions: { scss: { api: 'modern' } } },
  },

  // Nitro server config
  nitro: {
    preset: 'node-server', // or 'cloudflare', 'vercel', etc.
    compressPublicAssets: true,
  },

  // Per-route rendering rules
  routeRules: {
    '/blog/**': { isr: 3600 },
    '/admin/**': { ssr: false },
  },

  // Devtools
  devtools: { enabled: true },

  // Compatibility date — determines which Nuxt 4 behavior set is active
  compatibilityDate: '2025-01-01',
})
```

**Key top-level options:**

- `modules` — Nuxt modules to load (build-time only)
- `runtimeConfig` — environment-aware config (private + public split)
- `app` — head defaults, global page transitions, root tag settings
- `vite` — Vite configuration passthrough
- `nitro` — Nitro server configuration (preset, storage, caching)
- `routeRules` — per-route rendering/caching rules
- `devtools` — enable/disable Nuxt DevTools
- `compatibilityDate` — feature flag date for breaking changes
- `typescript` — TypeScript strictness settings
- `components` — component auto-import directory config
- `imports` — composable/util auto-import directory config

### TypeScript Strictness

Your `tsconfig.json` looks minimal:

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

All the magic is in `.nuxt/tsconfig.json` (generated). It includes paths for auto-imports, module resolution, and type references. To enable strict mode:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  typescript: {
    strict: true,     // Enables strict: true in generated tsconfig
    typeCheck: true,  // Runs vue-tsc during dev and build (slower but catches errors)
  },
})
```

`strict: true` gives you `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes` — the full suite. Do this from day one. Retrofitting strict mode onto a large codebase is painful.

`typeCheck: true` runs `vue-tsc` in parallel during dev. It's slower but catches template type errors that your IDE might miss. Enable it in CI at minimum; optionally during dev if your machine handles it.

### Devtools Activation

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
})
```

Press **Shift+Alt+D** in the browser (or click the Nuxt icon at page bottom) to open DevTools. Tabs you'll use most:

- **Overview** — active modules, Nuxt version, rendering mode
- **Pages** — all routes with their middleware and layouts
- **Components** — component tree with props/state inspection
- **Imports** — every auto-imported function and its source
- **Server Routes** — all API endpoints with method and path
- **State** — reactive state (useState, Pinia stores)
- **Payload** — SSR payload transferred to client
- **Modules** — installed modules and their hooks

DevTools are stripped from production builds automatically. No need to disable them for deploy.

### Runtime Config and Environment Variables

The runtime config system has a convention for env var overrides:

```typescript
// nuxt.config.ts
runtimeConfig: {
  apiSecret: 'default-dev-secret',  // → NUXT_API_SECRET
  database: {
    host: 'localhost',              // → NUXT_DATABASE_HOST
    port: 5432,                     // → NUXT_DATABASE_PORT
  },
  public: {
    apiBase: '/api',                // → NUXT_PUBLIC_API_BASE
  },
}
```

The convention: `NUXT_` prefix + path in SCREAMING_SNAKE_CASE. Nested objects use underscore separators. This works at runtime — no rebuild needed. Just set the env var and restart the server.

Access in code:

```typescript
// Server-side (full access)
const config = useRuntimeConfig()
config.apiSecret        // ✓ available
config.public.apiBase   // ✓ available

// Client-side (public only)
const config = useRuntimeConfig()
config.apiSecret        // ✗ undefined (stripped from client bundle)
config.public.apiBase   // ✓ available
```

## Walkthrough

Open the `01-scaffold` starter:

```bash
cd starters/01-scaffold
npm install
npm run dev
```

1. **Explore `nuxt.config.ts`.** Note the devtools and runtimeConfig already configured.
2. **Open DevTools** (Shift+Alt+D). Check the Imports tab — see every auto-imported function.
3. **Test runtimeConfig.** Create `server/api/config.get.ts`:
   ```typescript
   export default defineEventHandler(() => {
     const config = useRuntimeConfig()
     return { secret: config.apiSecret, public: config.public }
   })
   ```
   Hit `/api/config` — you'll see the private key is accessible server-side.
4. **Test env override.** Stop the server. Run `NUXT_API_SECRET=overridden npm run dev`. Hit `/api/config` again — value changed without rebuild.
5. **Check TypeScript.** Open any `.vue` file — auto-imports should resolve without red squiggles. If not, run `npx nuxi prepare`.

## Gotchas

- **`runtimeConfig.public` is PUBLIC.** It's serialized into the client bundle. Never put API keys, database credentials, or tokens here. Use the private (top-level) runtimeConfig for secrets, accessible only in server routes.
- **Changing `nuxt.config.ts` requires dev server restart.** Unlike `.vue` files which hot-reload, config changes need a full restart. Nuxt will usually detect this and prompt you.
- **`compatibilityDate` matters.** It's not cosmetic. Nuxt 4 uses this date to determine which behavior set is active. Setting it to today opts you into the latest breaking changes. Setting it to an older date preserves legacy behavior. Always use the date when you started the project, then bump it deliberately.
- **Don't edit `.nuxt/`.** It's regenerated on every `prepare`/`dev`/`build`. But DO read `.nuxt/tsconfig.json` when debugging type issues — it shows you exactly what paths and types are registered.
- **`typeCheck: true` is slow.** It spawns `vue-tsc` in a separate process. During active development, rely on your IDE's type checking and enable `typeCheck` only in CI or pre-commit hooks.
- **Module order matters.** Modules listed earlier in the array run first. If module B depends on something module A provides, A must come first.

## Exercise

1. Run `npx nuxi init scratch-app` — scaffold a fresh project.
2. Configure it:
   - Enable `typescript.strict`
   - Enable `devtools`
   - Add `runtimeConfig` with `apiSecret: ''` (private) and `public.apiBase: '/api'`
3. Create a server route `server/api/health.get.ts` that returns `{ status: 'ok', apiBase: config.public.apiBase }`.
4. Verify the private `apiSecret` is NOT accessible from the client. Use `useRuntimeConfig()` in a component and check what's available.
5. Override `NUXT_PUBLIC_API_BASE=https://prod.api.com` via env var and confirm the change without rebuilding.

## Further Reading

- [Installation Guide](https://nuxt.com/docs/4.x/getting-started/installation)
- [Configuration Guide](https://nuxt.com/docs/4.x/getting-started/configuration)
- [nuxt.config.ts Reference](https://nuxt.com/docs/4.x/guide/directory-structure/nuxt-config)
- [Runtime Config Guide](https://nuxt.com/docs/4.x/guide/going-further/runtime-config)
