# Changes from Previous Starter

## Chapter 08: Components

### What was added

**Component patterns demonstrated:**

1. **Auto-imported components** — `components/AppHeader.vue` is available everywhere as `<AppHeader>` with no import statement needed.

2. **Path-based naming** — Components in subdirectories use the path as a prefix:
   - `components/ui/Button.vue` → `<UiButton>`
   - `components/ui/Card.vue` → `<UiCard>`
   - `components/dashboard/StatsWidget.client.vue` → `<DashboardStatsWidget>`

3. **Named slots** — `UiCard` uses `#header`, default, and `#footer` slots for flexible composition.

4. **Client-only components (.client.vue)** — `StatsWidget.client.vue` only renders on the client. It safely uses `window.innerWidth` because it never runs during SSR.

5. **Server-only components (.server.vue)** — `StaticFooter.server.vue` renders on the server and is never hydrated on the client. Ideal for static content that doesn't need interactivity.

6. **Lazy loading (Lazy prefix)** — Any component can be prefixed with `Lazy` to enable automatic code-splitting. `<LazyHeavyChart>` is only loaded when `v-if` becomes true.

7. **`<ClientOnly>` wrapper** — Used with `#fallback` slot to show placeholder content during SSR before the client component mounts.

### File structure

```
08-components/
├── app.vue
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── layouts/
│   └── default.vue
├── components/
│   ├── AppHeader.vue            ← auto-imported as <AppHeader>
│   ├── HeavyChart.vue           ← used as <LazyHeavyChart>
│   ├── StaticFooter.server.vue  ← server-only
│   ├── ui/
│   │   ├── Button.vue           ← <UiButton>
│   │   └── Card.vue             ← <UiCard>
│   └── dashboard/
│       └── StatsWidget.client.vue ← client-only <DashboardStatsWidget>
└── pages/
    ├── index.vue                ← demos all component patterns
    └── about.vue                ← shows auto-import works across pages
```

### Key concepts

- Nuxt auto-scans `components/` — no manual registration needed
- Directory structure determines the component name prefix
- `.client.vue` suffix = client-only (skipped during SSR)
- `.server.vue` suffix = server-only (no JS shipped to client)
- `Lazy` prefix = code-split into a separate chunk, loaded on demand
- `<ClientOnly>` with `#fallback` = graceful SSR handling for client components
