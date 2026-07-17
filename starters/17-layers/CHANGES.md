# Changes — Chapter 17: Layers & Monorepo

## What This Starter Demonstrates

### Extending a Layer

The app's `nuxt.config.ts` uses `extends` to pull in a local layer:

```typescript
export default defineNuxtConfig({
  extends: ['./layers/base'],
})
```

This merges the layer's components, composables, layouts, and config into the app.

### What the Base Layer Provides

| Directory | Contents |
|-----------|----------|
| `layers/base/components/` | `BaseButton.vue`, `BaseCard.vue` |
| `layers/base/composables/` | `useGreeting.ts` |
| `layers/base/layouts/` | `default.vue` |
| `layers/base/nuxt.config.ts` | Sets `app.head.title` |

All of these are auto-imported and available in the main app without explicit imports.

### Overriding Layer Files

The app has its own `components/BaseButton.vue` with a blue design. Because the app-level file has the same name as the layer's component, it **wins** — the layer's gray button is replaced everywhere.

Key rule: **app-level files always take priority over layer files.**

`BaseCard` has no app-level override, so the layer's version is used as-is.

### When to Use Layers

- **Shared design system** — components, styles, layouts reused across multiple apps
- **Multi-tenant apps** — base app logic in a layer, tenant-specific overrides in the app
- **Monorepo patterns** — shared config, utilities, and components extracted to a layer
- **Starter templates** — provide defaults that downstream projects can override

### Layer Config Merging

Layer configs are merged recursively. The app's config takes precedence for conflicting keys. Arrays (like `modules`) are concatenated.

## Key Files Added

- `layers/base/` — complete base layer with its own `nuxt.config.ts`
- `components/BaseButton.vue` — app-level override (blue instead of gray)
- `pages/index.vue` — demonstrates override, composable from layer, card from layer
- `pages/about.vue` — proves layer features work across all pages
