---
render_with_liquid: false
title: "Modules & Plugins"
layout: chapter
nav_order: 13
parent: Home
starter: "12-modules"
official_docs:
  - https://nuxt.com/docs/4.x/guide/directory-structure/plugins
  - https://nuxt.com/docs/4.x/guide/going-further/modules
---

# Modules & Plugins

## TL;DR

Modules extend Nuxt at **build time** — they modify config, inject plugins, add components, register server routes. Plugins run at **app initialization** — they provide globals, set up libraries, and configure runtime behavior. Modules are for tooling and framework extensions. Plugins are for runtime setup. Most community packages are modules; your app-specific runtime setup goes in plugins.

## Mental Model

```
Build Time (nuxt build)
  └── Modules execute
       ├── Modify nuxt.config
       ├── Add components, composables, plugins
       ├── Register hooks (build, nitro, vite)
       └── Generate code into .nuxt/

App Initialization (first request / page load)
  └── Plugins execute
       ├── Set up third-party libraries
       ├── Provide global helpers (useNuxtApp().$helper)
       ├── Register Vue directives/components
       └── Run once, then app renders
```

**Key distinction:** Modules can do anything to the build pipeline. Plugins can only do things at runtime. If you need to modify Vite config, register route rules, or auto-import files — that's a module. If you need to initialize a library, provide a helper, or set up error tracking — that's a plugin.

### Using Community Modules

```bash
# Install module
npx nuxi module add @nuxtjs/tailwindcss
# This installs the package AND adds it to nuxt.config.ts modules[]
```

Or manually:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxtjs/sitemap',
  ],
  // Module-specific configuration (top-level keys)
  tailwindcss: {
    exposeConfig: true,
  },
  image: {
    quality: 80,
    formats: ['webp', 'avif'],
  },
})
```

Find modules at [nuxt.com/modules](https://nuxt.com/modules). The registry shows compatibility, downloads, and maintenance status.

### defineNuxtPlugin

Plugin files go in `plugins/` and are auto-registered:

```typescript
// plugins/analytics.client.ts  ← .client suffix = client-only
export default defineNuxtPlugin((nuxtApp) => {
  // Initialize analytics SDK
  const analytics = initAnalytics(useRuntimeConfig().public.analyticsId)

  // Track page views on route change
  nuxtApp.hook('page:finish', () => {
    analytics.trackPageView(useRoute().fullPath)
  })

  // Provide for use elsewhere
  return {
    provide: {
      analytics,
    },
  }
})
```

```typescript
// plugins/error-tracker.ts  ← no suffix = runs on both server and client
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    reportError(error, { component: instance?.$options.name, info })
  }
})
```

```typescript
// plugins/auth.server.ts  ← .server suffix = server-only
export default defineNuxtPlugin(async (nuxtApp) => {
  // Validate auth token on every SSR request
  const token = useCookie('auth-token')
  if (token.value) {
    try {
      const user = await $fetch('/api/auth/verify', {
        headers: { authorization: `Bearer ${token.value}` },
      })
      useState('auth-user', () => user)
    } catch {
      token.value = null
    }
  }
})
```

**Suffixes:**
- `.client.ts` — runs only on the client (after hydration)
- `.server.ts` — runs only on the server (during SSR)
- `.ts` (no suffix) — runs on both

### Plugin Order and Dependencies

Plugins execute in alphabetical filename order by default. Control order with:

```typescript
// plugins/01.auth.ts  ← numeric prefix controls order
export default defineNuxtPlugin({
  name: 'auth',
  enforce: 'pre',     // 'pre' runs before default, 'post' runs after
  parallel: false,     // Wait for this plugin before continuing (default)
  dependsOn: ['pinia'], // Wait for 'pinia' plugin to finish first
  async setup(nuxtApp) {
    // Plugin logic
  },
})
```

**`parallel: true`** — plugin doesn't block other plugins from starting. Use for independent initialization (analytics, logging) that doesn't affect rendering.

**`dependsOn`** — wait for named plugins to complete first. The target plugin must have a `name` set.

### Provide/Inject Pattern

Plugins can provide helpers accessible app-wide via `useNuxtApp()`:

```typescript
// plugins/toast.ts
export default defineNuxtPlugin(() => {
  const toasts = ref<Toast[]>([])

  function show(message: string, type: 'success' | 'error' = 'success') {
    const id = crypto.randomUUID()
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), 5000)
    return id
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    provide: {
      toast: { show, dismiss, toasts },
    },
  }
})
```

Access in components:

```vue
<script setup lang="ts">
const { $toast } = useNuxtApp()
$toast.show('Item saved!', 'success')
</script>
```

**Type declarations** for provided values:

```typescript
// types/plugins.d.ts
declare module '#app' {
  interface NuxtApp {
    $toast: {
      show: (message: string, type?: 'success' | 'error') => string
      dismiss: (id: string) => void
      toasts: Ref<Toast[]>
    }
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $toast: NuxtApp['$toast']
  }
}

export {}
```

### Writing a Local Module

For project-specific build-time extensions, create modules in the `modules/` directory:

```typescript
// modules/auto-icons.ts
import { defineNuxtModule, addComponent } from '@nuxt/kit'
import { readdirSync } from 'node:fs'
import { resolve, parse } from 'node:path'

export default defineNuxtModule({
  meta: {
    name: 'auto-icons',
    configKey: 'autoIcons',
  },
  defaults: {
    dir: 'assets/icons',
    prefix: 'Icon',
  },
  setup(options, nuxt) {
    const iconsDir = resolve(nuxt.options.srcDir, options.dir)

    // Register each SVG as a component
    const files = readdirSync(iconsDir).filter(f => f.endsWith('.svg'))

    for (const file of files) {
      const { name } = parse(file)
      const pascalName = name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())

      addComponent({
        name: `${options.prefix}${pascalName}`,
        filePath: resolve(iconsDir, file),
      })
    }

    console.log(`[auto-icons] Registered ${files.length} icon components`)
  },
})
```

Local modules in `modules/` are auto-registered — no need to add them to `nuxt.config.ts modules[]`.

**More Kit utilities:**

```typescript
import {
  defineNuxtModule,
  addPlugin,          // Register a plugin
  addComponent,       // Register a component
  addImports,         // Add auto-imports
  addServerHandler,   // Register a server route
  addTemplate,        // Generate files into .nuxt/
  createResolver,     // Resolve paths relative to module
  addRouteMiddleware, // Register route middleware
  extendPages,        // Modify route table
} from '@nuxt/kit'
```

### Nuxt Hook System

Modules hook into Nuxt's lifecycle for powerful extensions:

```typescript
// modules/seo-defaults.ts
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'seo-defaults' },
  setup(options, nuxt) {
    // Hook: modify pages at build time
    nuxt.hook('pages:extend', (pages) => {
      // Add a catch-all 404 page programmatically
      pages.push({
        name: 'catch-all',
        path: '/:slug(.*)*',
        file: resolve(__dirname, '../pages/[...slug].vue'),
      })
    })

    // Hook: modify Nitro config
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = nitroConfig.prerender.routes || []
      nitroConfig.prerender.routes.push('/sitemap.xml')
    })

    // Hook: after all modules done
    nuxt.hook('modules:done', () => {
      console.log('All modules loaded')
    })

    // Hook: modify Vite config
    nuxt.hook('vite:extendConfig', (viteConfig) => {
      viteConfig.optimizeDeps = viteConfig.optimizeDeps || {}
      viteConfig.optimizeDeps.include = viteConfig.optimizeDeps.include || []
      viteConfig.optimizeDeps.include.push('some-heavy-dep')
    })
  },
})
```

**Common hooks:**

| Hook | When | Use for |
|------|------|---------|
| `modules:done` | All modules registered | Final config validation |
| `pages:extend` | Routes generated | Add/modify routes |
| `components:extend` | Components scanned | Register additional components |
| `imports:extend` | Auto-imports scanned | Add custom imports |
| `nitro:config` | Nitro configuring | Modify server config |
| `vite:extendConfig` | Vite configuring | Add Vite plugins/config |
| `build:before` | Build starting | Pre-build steps |
| `build:done` | Build finished | Post-build steps |

**Runtime hooks** (available in plugins):

| Hook | When | Use for |
|------|------|---------|
| `app:created` | Vue app created | Early setup |
| `page:start` | Navigation starting | Loading indicators |
| `page:finish` | Navigation complete | Analytics, scroll |
| `vue:error` | Vue error caught | Error reporting |
| `app:error` | App-level error | Global error handling |

### Inline Modules

For simple one-off build-time logic, define modules inline in config:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    // Inline module
    (options, nuxt) => {
      nuxt.hook('pages:extend', (pages) => {
        // Custom route manipulation
      })
    },
  ],
})
```

### Vue Plugin Registration via Nuxt Plugin

When you need to register a Vue plugin (third-party UI library, directive, etc.):

```typescript
// plugins/vue-tippy.client.ts
import VueTippy from 'vue-tippy'
import 'tippy.js/dist/tippy.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueTippy, {
    defaultProps: { placement: 'top' },
  })
})
```

```typescript
// plugins/directives.ts
export default defineNuxtPlugin((nuxtApp) => {
  // Register global directive
  nuxtApp.vueApp.directive('focus', {
    mounted(el) {
      el.focus()
    },
  })
})
```

## Walkthrough

1. **Install a community module:**
   ```bash
   npx nuxi module add @nuxtjs/tailwindcss
   ```
   Verify it's in `nuxt.config.ts` and working.

2. **Create a plugin providing `$toast`:**
   - `plugins/toast.client.ts` — show/dismiss notifications
   - Add type declarations
   - Use `$toast.show()` from a component

3. **Create a client-only analytics plugin:**
   - `plugins/analytics.client.ts`
   - Hook into `page:finish` for page view tracking
   - Provide `$analytics.track(event, data)` helper

4. **Write a local module:**
   - `modules/auto-imports-log.ts` — hooks into `imports:extend` and logs all auto-imported functions
   - Run `npm run dev` and check console output

5. **Use hooks in a plugin:**
   - Track navigation timing with `page:start` and `page:finish`

## Gotchas

- **Modules run at BUILD time.** They can't access runtime state, cookies, request headers, or user data. They configure the build, not the request.
- **Plugins in `plugins/` are auto-registered.** Don't add them to `nuxt.config.ts` — that's double registration. Only external plugins (from packages) need manual registration.
- **Plugin `provide` values are NOT reactive by default.** They're static helpers. If you need reactive state, use `useState` inside the provided function or return refs.
- **`.client.ts` plugins don't run during SSR.** Any state they set won't be in the initial HTML. Don't use them for SEO-critical data or hydration-sensitive state.
- **Module order in `modules[]` matters.** Modules execute in array order. If module B depends on something module A sets up (like a plugin or component), A must come first.
- **Don't confuse `modules/` directory with `node_modules`.** `modules/` at project root holds YOUR local modules. Community modules come from npm packages listed in `nuxt.config.ts modules[]`.
- **`useNuxtApp()` in plugins is the plugin context.** In the setup function, you receive `nuxtApp` as a parameter. Outside setup (in provided functions), use `useNuxtApp()`.
- **Async plugins block rendering.** If your plugin is `async` and doesn't set `parallel: true`, it blocks the app from rendering until complete. Make network calls in plugins carefully — or mark them parallel.
- **Module hooks are type-safe.** Use `nuxt.hook('hookName', ...)` with autocomplete to discover available hooks and their callback signatures.

## Exercise

1. **Write a plugin** — `plugins/format.ts`:
   - Provides `$format.currency(amount, currency)` and `$format.date(date, locale)`
   - Works on both server and client
   - Add type declarations in `types/plugins.d.ts`
   - Use in a component: `{{ $format.currency(product.price) }}`

2. **Write a local module** — `modules/api-routes-log.ts`:
   - Hooks into `nitro:config`
   - After server routes are scanned, logs all registered API paths
   - Useful for debugging "why isn't my route working?"

3. **Create a directive plugin** — `plugins/directives.ts`:
   - `v-click-outside` directive (common utility)
   - Client-only (uses DOM APIs)
   - Register with `nuxtApp.vueApp.directive()`

## Further Reading

- [Plugins Directory](https://nuxt.com/docs/4.x/guide/directory-structure/plugins)
- [Modules Guide](https://nuxt.com/docs/4.x/guide/going-further/modules)
- [Nuxt Kit](https://nuxt.com/docs/4.x/guide/going-further/kit)
- [Hooks Lifecycle](https://nuxt.com/docs/4.x/guide/going-further/hooks)
- [Module Marketplace](https://nuxt.com/modules)
