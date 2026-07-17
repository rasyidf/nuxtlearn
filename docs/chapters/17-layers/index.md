---
title: "Layers & Monorepo"
layout: chapter
nav_order: 18
parent: Home
starter: "17-layers"
official_docs:
  - https://nuxt.com/docs/4.x/getting-started/layers
  - https://nuxt.com/docs/4.x/guide/going-further/layers
---

# Layers & Monorepo

## TL;DR

Nuxt Layers let you compose and extend applications. A layer provides components, composables, pages, server routes, and config that merge into the consuming app. The consuming app can override anything. Combined with monorepo workspaces, layers enable shared base apps, theme packages, and modular architecture. Think of it as inheritance for Nuxt apps.

## Mental Model

```
Base Layer (shared foundation)
  └── provides: components, composables, layouts, config
       │
       ├── App A (extends base, overrides some components)
       └── App B (extends base, different theme/config)
```

Layers follow a cascade model:
1. Base layer provides defaults
2. Additional layers override/extend
3. The consuming app always wins (highest priority)

This is like CSS specificity but for your entire app structure. Same-name files in the consumer override the layer's version.

### extends in nuxt.config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    './layers/base',                     // Local directory
    '@my-org/nuxt-base-layer',           // npm package
    'github:my-org/nuxt-theme#main',     // Git repository
  ],
})
```

**Resolution order (lowest to highest priority):**
1. First layer in `extends` array
2. Second layer in `extends` array
3. ... subsequent layers
4. **The consuming app itself** (always wins)

Multiple layers stack. Later layers override earlier ones. Your app overrides all layers.

### Creating a Base Layer

A layer is just a Nuxt-compatible directory structure. Minimum: a `nuxt.config.ts`:

```
layers/base/
├── nuxt.config.ts        ← Required (marks this as a layer)
├── components/
│   ├── BaseButton.vue
│   ├── BaseCard.vue
│   └── AppHeader.vue
├── composables/
│   └── useAuth.ts
├── layouts/
│   └── default.vue
├── middleware/
│   └── auth.ts
├── server/
│   └── api/
│       └── health.get.ts
├── assets/
│   └── css/
│       └── base.css
└── app.config.ts
```

```typescript
// layers/base/nuxt.config.ts
export default defineNuxtConfig({
  // Config provided by this layer
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/base.css'],  // ~ resolves to the layer's root
  runtimeConfig: {
    public: {
      appName: 'Default App Name',
    },
  },
})
```

Now any app that extends this layer gets all those components, composables, layouts, middleware, server routes, and config merged in — without copying code.

### What Layers Can Provide

| Feature | Behavior |
|---------|----------|
| Components | Added to component auto-import scan |
| Composables | Added to composable auto-import scan |
| Utils | Added to utils auto-import scan |
| Pages | Merged into the route table |
| Layouts | Available for use via `definePageMeta` |
| Middleware | Available for use via `definePageMeta` |
| Server routes | Merged into Nitro server |
| Plugins | Auto-registered |
| Assets/CSS | Available via `~` alias (layer's root) |
| `nuxt.config.ts` | Deep-merged with consuming app |
| `app.config.ts` | Deep-merged with consuming app |

### Overriding Layer Content

Same-name files in the consuming app override the layer:

```
layers/base/
├── components/
│   └── AppHeader.vue      ← Layer's version

my-app/
├── components/
│   └── AppHeader.vue      ← This wins (overrides layer)
```

```
layers/base/
├── composables/
│   └── useAuth.ts         ← Layer's version (basic auth)

my-app/
├── composables/
│   └── useAuth.ts         ← This wins (custom auth logic)
```

**Config merging** — deep merge with consuming app winning:

```typescript
// layers/base/nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    public: { appName: 'Base App', theme: 'light' },
  },
})

// my-app/nuxt.config.ts
export default defineNuxtConfig({
  extends: ['./layers/base'],
  runtimeConfig: {
    public: { appName: 'My Custom App' },  // Overrides, theme: 'light' preserved
  },
})
// Result: { appName: 'My Custom App', theme: 'light' }
```

### Config-Only Layers

A layer that provides shared configuration without components or pages:

```
layers/org-config/
├── nuxt.config.ts
└── package.json
```

```typescript
// layers/org-config/nuxt.config.ts
export default defineNuxtConfig({
  // Organization-wide standards
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/image',
  ],
  typescript: {
    strict: true,
    typeCheck: true,
  },
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      sentryDsn: '',
      analyticsId: '',
    },
  },
  nitro: {
    compressPublicAssets: true,
  },
})
```

Every app in the organization extends this layer — guaranteed consistent tooling, TypeScript settings, and module stack.

### Monorepo Setup

Using pnpm workspaces (recommended):

```
my-monorepo/
├── package.json
├── pnpm-workspace.yaml
├── layers/
│   ├── base/
│   │   ├── package.json     ← name: "@my-org/base-layer"
│   │   ├── nuxt.config.ts
│   │   └── components/...
│   └── admin/
│       ├── package.json     ← name: "@my-org/admin-layer"
│       ├── nuxt.config.ts
│       └── pages/...
└── apps/
    ├── storefront/
    │   ├── package.json     ← depends on @my-org/base-layer
    │   ├── nuxt.config.ts   ← extends: ['@my-org/base-layer']
    │   └── pages/...
    └── admin-panel/
        ├── package.json     ← depends on @my-org/base-layer, @my-org/admin-layer
        ├── nuxt.config.ts   ← extends: ['@my-org/base-layer', '@my-org/admin-layer']
        └── pages/...
```

```yaml
# pnpm-workspace.yaml
packages:
  - 'layers/*'
  - 'apps/*'
```

```json
// layers/base/package.json
{
  "name": "@my-org/base-layer",
  "version": "1.0.0",
  "type": "module"
}
```

```json
// apps/storefront/package.json
{
  "name": "@my-org/storefront",
  "dependencies": {
    "@my-org/base-layer": "workspace:*"
  }
}
```

```typescript
// apps/storefront/nuxt.config.ts
export default defineNuxtConfig({
  extends: ['@my-org/base-layer'],
  // App-specific config...
})
```

**Hot reload works across packages.** When you edit a component in `layers/base/`, apps that extend it hot-reload automatically (pnpm workspace symlinks enable this).

### Layer Development Tips

**Testing a layer in isolation:**

```typescript
// layers/base/nuxt.config.ts
export default defineNuxtConfig({
  // When running the layer standalone (npm run dev in the layer dir)
  // it needs to be a complete app:
  devtools: { enabled: true },
})
```

```json
// layers/base/package.json
{
  "scripts": {
    "dev": "nuxi dev",
    "build": "nuxi build"
  }
}
```

You can `cd layers/base && npm run dev` to develop the layer in isolation before using it from apps.

**Layer-relative paths:**

```typescript
// Inside a layer, ~ resolves to the LAYER's root
// layers/base/nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/assets/css/base.css'],  // → layers/base/assets/css/base.css
})
```

In components within the layer, `~/` also resolves to the layer root. But `#imports` and auto-imports resolve globally across all layers + app.

### Publishing Layers as Packages

For sharing across teams/projects:

```json
// layers/base/package.json
{
  "name": "@my-org/nuxt-base-layer",
  "version": "2.1.0",
  "type": "module",
  "main": "./nuxt.config.ts",
  "files": [
    "nuxt.config.ts",
    "components",
    "composables",
    "layouts",
    "middleware",
    "server",
    "assets",
    "app.config.ts"
  ],
  "peerDependencies": {
    "nuxt": "^4.0.0"
  }
}
```

Publish to npm (or a private registry). Consumers install and extend:

```bash
npm install @my-org/nuxt-base-layer
```

```typescript
// Consumer's nuxt.config.ts
export default defineNuxtConfig({
  extends: ['@my-org/nuxt-base-layer'],
})
```

### Multi-App Architecture Patterns

**Pattern 1: Shared Base + App Variants**

```
base-layer → storefront (e-commerce)
           → admin-panel (internal tool)
           → docs-site (documentation)
```

All apps share auth, design system, utilities. Each has unique pages and features.

**Pattern 2: Feature Layers**

```
app extends [auth-layer, billing-layer, analytics-layer, ui-layer]
```

Each layer encapsulates one feature domain. The app composes them together.

**Pattern 3: Theme Layers**

```
app extends [base-layer, dark-theme-layer]
```

Theme layer overrides CSS, layout, and design tokens from the base.

## Walkthrough

1. **Create a base layer:**
   ```bash
   mkdir -p layers/base/{components,composables,layouts}
   ```
   Add `nuxt.config.ts`, a default layout, and a shared `BaseButton.vue` component.

2. **Create a consuming app:**
   ```bash
   mkdir apps/main
   ```
   Extend the base layer. Verify the layout and components are available without copying.

3. **Override a component:**
   Create `apps/main/components/BaseButton.vue` with different styling. Verify it replaces the layer's version.

4. **Set up the monorepo:**
   Add `pnpm-workspace.yaml`. Link packages. Run `pnpm dev` from the app — verify hot-reload works when editing layer files.

5. **Add a config-only layer:**
   Create `layers/org-config/` with shared module and TypeScript settings. Extend from both apps.

## Gotchas

- **Deep merge surprises.** Config from layers merges deeply. Arrays are concatenated, not replaced. If both the layer and app define `modules: [...]`, you get BOTH arrays combined. Use layer config sparingly and predictably.
- **Component name collisions.** If two layers provide `Button.vue`, the later layer wins. Use prefixes (`BaseButton`, `AdminButton`) to avoid unintentional overrides.
- **Layers can't be conditional.** Once in `extends`, a layer always applies. For conditional features, use modules (which can check config/env and decide what to add).
- **Git-based layers fetch at install time.** `extends: ['github:org/repo']` downloads at `npm install`, not live-linked. For development, use local paths or workspace references.
- **Layer pages merge into the route table.** If a layer provides `pages/admin.vue` and your app has `pages/admin.vue`, your app's version wins. But if only the layer provides it, it appears in your app's routes.
- **Monorepo hot-reload requires workspace protocol.** Use `"@my-org/base": "workspace:*"` in package.json, not a version number. This creates symlinks that enable file watching.
- **Layer extends order matters.** `extends: ['A', 'B']` — B overrides A. Your app overrides both. If A and B both provide `Header.vue`, B's version is used.
- **Don't over-layer.** Layers add complexity. Use them when you genuinely have multiple apps sharing code. A single app doesn't need layers — just organize with directories.
- **Debug with `nuxi info`.** Shows resolved layer stack, merged config, and active modules. Use when layer interactions are confusing.

## Exercise

Build a monorepo with layers:

1. **Base layer** (`layers/base/`):
   - Shared components: `BaseButton`, `BaseCard`, `BaseModal`
   - Default layout with header/footer
   - Auth middleware + `useAuth` composable
   - Health check server route
   - TypeScript strict mode in config

2. **Admin app** (`apps/admin/`):
   - Extends base layer
   - Overrides the default layout (adds sidebar)
   - Adds admin-specific pages: `/users`, `/settings`
   - Uses auth middleware from the base

3. **Storefront app** (`apps/storefront/`):
   - Extends base layer
   - Overrides `BaseButton` with different styling
   - Adds store-specific pages: `/products`, `/cart`
   - Different `app.config.ts` (different theme colors)

4. **Verify:**
   - Both apps have the shared components and middleware
   - Override in storefront doesn't affect admin
   - Hot-reload works across layer boundaries
   - `nuxi info` shows the resolved layer stack

## Further Reading

- [Layers Getting Started](https://nuxt.com/docs/4.x/getting-started/layers)
- [Layers In-Depth](https://nuxt.com/docs/4.x/guide/going-further/layers)
- [Layer Examples](https://github.com/nuxt/examples/tree/main/advanced/layers)
- [pnpm Workspaces](https://pnpm.io/workspaces)
