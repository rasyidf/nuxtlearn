---
render_with_liquid: false
title: "Components"
layout: chapter
nav_order: 9
parent: Home
starter: "08-components"
official_docs:
  - https://nuxt.com/docs/4.x/guide/directory-structure/components
  - https://nuxt.com/docs/4.x/api/components/client-only
---

# Components

## TL;DR

Nuxt auto-imports all components from `components/`. Directory path becomes the component name (`components/ui/Button.vue` → `<UiButton>`). Special patterns: `<ClientOnly>` skips SSR for browser-only code, the `Lazy` prefix defers component loading until render time, and server-only `.server.vue` components render HTML without shipping JS to the client. Understanding resolution order prevents naming conflicts.

## Mental Model

The `components/` directory is auto-scanned recursively at build time. Every `.vue` file found becomes a globally-available component (no imports needed). The component name is derived from the path:

```
components/
├── AppHeader.vue         → <AppHeader>
├── ui/
│   ├── Button.vue        → <UiButton>
│   ├── Card.vue          → <UiCard>
│   └── form/
│       ├── Input.vue     → <UiFormInput>
│       └── Select.vue    → <UiFormSelect>
└── dashboard/
    └── StatsChart.vue    → <DashboardStatsChart>
```

The path segments become the prefix in PascalCase. This prevents naming collisions — you can have `components/admin/Table.vue` and `components/user/Table.vue` without conflict (they become `<AdminTable>` and `<UserTable>`).

**Important:** Components are tree-shaken. They're "auto-imported" but only included in the bundle if actually used in a template. Unused components cost nothing.

### Auto-Import Resolution Order

When Nuxt encounters `<MyComponent>` in a template:

1. **Direct path match in `components/`** — scanned recursively, path-prefixed names
2. **Explicit imports** — `import MyComponent from '~/components/elsewhere/MyComponent.vue'`
3. **Global registration** — registered via plugin or `components: { global: true }` in config

If two components resolve to the same name, the one with the shorter path wins. At the same depth, alphabetical order wins. In practice: keep names unique, don't rely on priority rules.

### Naming Conventions

```
components/
├── TheHeader.vue         → <TheHeader> (singleton, "The" prefix)
├── base/
│   └── Button.vue        → <BaseButton> (generic base component)
├── ui/
│   └── Modal.vue         → <UiModal>
└── feature/
    └── UserCard.vue      → <FeatureUserCard>
```

**Flatten with `pathPrefix: false`:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  components: [
    { path: '~/components/ui', pathPrefix: false },
    // components/ui/Button.vue → <Button> instead of <UiButton>
  ],
})
```

This removes the directory name from the component name. Useful for a UI library directory where everything is already prefixed (e.g., `UiButton.vue` would become `<UiButton>` not `<UiUiButton>`).

### ClientOnly

Wraps components that depend on browser APIs (`window`, `document`, `navigator`, DOM measurements, third-party scripts):

```vue
<template>
  <div>
    <h1>Dashboard</h1>

    <!-- This chart library uses canvas/window — can't SSR -->
    <ClientOnly>
      <ApexChart :options="chartOptions" :series="chartData" />

      <!-- Shown during SSR and until client hydrates -->
      <template #fallback>
        <div class="chart-skeleton animate-pulse" style="height: 300px" />
      </template>
    </ClientOnly>
  </div>
</template>
```

**What happens:**
- During SSR: the `<ApexChart>` is NOT rendered. The `#fallback` slot renders instead. HTML is sent with the placeholder.
- During hydration: `<ClientOnly>` mounts, renders `<ApexChart>` client-side. Fallback disappears.

**The `#fallback` slot** is critical for UX — without it, the user sees nothing (empty space) until hydration completes. Always provide a fallback that matches the approximate size of the real component to prevent layout shift.

**`.client.vue` suffix alternative:**

```
components/
├── Chart.client.vue      → Only renders on client (auto-wrapped in ClientOnly)
└── Chart.vue             → Regular component (renders everywhere)
```

Files ending in `.client.vue` are automatically client-only — you don't need to wrap them in `<ClientOnly>`. But you lose the `#fallback` slot option.

### Lazy-Prefixed Components

Prefix any component with `Lazy` to defer its loading:

```vue
<template>
  <div>
    <!-- Loaded immediately (in the initial JS bundle) -->
    <AppHeader />

    <!-- Code-split: loaded only when this renders -->
    <LazyHeavyDataTable v-if="showTable" :data="tableData" />

    <!-- Also lazy: loaded when condition is true -->
    <LazyUserProfileModal v-if="isModalOpen" :user="selectedUser" />
  </div>
</template>
```

**How it works:** The `Lazy` prefix tells Nuxt to code-split that component into a separate chunk. It's loaded asynchronously when the component is actually rendered in the DOM. This reduces the initial page bundle size.

**Key distinction:** "Lazy" means code-splitting, NOT viewport-triggered. The component loads when its parent decides to render it (e.g., `v-if` becomes true). It does NOT wait until the component scrolls into view. For viewport-triggered loading, you need an Intersection Observer pattern on top.

```vue
<script setup lang="ts">
// Pattern: lazy load when component enters viewport
const target = ref<HTMLElement>()
const isVisible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      isVisible.value = true
      observer.disconnect()
    }
  })
  if (target.value) observer.observe(target.value)
})
</script>

<template>
  <div ref="target">
    <LazyHeavyWidget v-if="isVisible" />
    <div v-else class="placeholder" style="height: 400px" />
  </div>
</template>
```

### Server-Only Components (.server.vue)

Components with the `.server.vue` suffix render ONLY on the server. The client receives HTML but no JavaScript for that component:

```vue
<!-- components/NewsletterSignup.server.vue -->
<template>
  <section class="newsletter">
    <h2>Subscribe to our newsletter</h2>
    <form action="/api/subscribe" method="POST">
      <input type="email" name="email" placeholder="your@email.com" required />
      <button type="submit">Subscribe</button>
    </form>
  </section>
</template>
```

**Use cases:**
- Static content that never needs client interactivity (footers, headers)
- Content rendered from a CMS (HTML passed through)
- Heavy components (markdown renderers, syntax highlighters) where you want zero client JS
- Server-rendered HTML email previews

**Limitations:**
- No `@click`, no `v-model`, no client-side event handling
- No reactive state changes after initial render
- If you need interactivity in parts, use slots with client components inside

### Nuxt Islands (Advanced)

Islands architecture takes server components further — they can re-render on the server in response to prop changes:

```vue
<!-- components/ProductPrice.server.vue -->
<script setup lang="ts">
const props = defineProps<{ productId: number }>()

// This runs on the server every time props change
const { data: price } = await useFetch(`/api/products/${props.productId}/price`)
</script>

<template>
  <span class="price">${{ price?.amount }}</span>
</template>
```

Enable in config:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    componentIslands: true,
  },
})
```

Or use `<NuxtIsland>` explicitly:

```vue
<template>
  <NuxtIsland name="ProductPrice" :props="{ productId: 42 }" />
</template>
```

Islands are best for content that's expensive to compute, changes server-side, and doesn't need client-side reactivity.

### Component Directories Configuration

Customize auto-import behavior in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  components: [
    // Default: scan ~/components with path prefix
    { path: '~/components' },

    // UI library: no path prefix, global registration
    { path: '~/components/ui', pathPrefix: false },

    // Shared components from a package
    { path: '~/node_modules/@my-org/shared-ui/components', prefix: 'Shared' },

    // Icons directory with custom prefix
    { path: '~/components/icons', prefix: 'Icon' },
    // components/icons/Arrow.vue → <IconArrow>

    // Only scan top level (no recursion)
    { path: '~/components/pages', pathPrefix: false, extensions: ['vue'] },
  ],
})
```

**Config options per directory:**

| Option | Description |
|--------|-------------|
| `path` | Directory to scan |
| `pathPrefix` | Use directory names as component name prefix (default: `true`) |
| `prefix` | Custom prefix to prepend to all components in this dir |
| `extensions` | File extensions to scan (default: `['vue', 'ts']`) |
| `global` | Register globally (not tree-shaken) |
| `watch` | Watch for changes in dev mode |
| `enabled` | Enable/disable this directory |

### Dynamic Components

Use Vue's `<component :is="">` with auto-imported component names:

```vue
<script setup lang="ts">
const widgets = [
  { type: 'ChartWidget', props: { data: chartData } },
  { type: 'TableWidget', props: { rows: tableRows } },
  { type: 'StatsWidget', props: { value: 42 } },
]
</script>

<template>
  <div v-for="widget in widgets" :key="widget.type">
    <component :is="widget.type" v-bind="widget.props" />
  </div>
</template>
```

For dynamic components to work with auto-imports, use `resolveComponent()`:

```vue
<script setup lang="ts">
const currentView = ref('DashboardOverview')

// resolveComponent works with auto-imported components
const viewComponent = computed(() => resolveComponent(currentView.value))
</script>

<template>
  <component :is="viewComponent" />
</template>
```

### Props, Emits, and Slots (Quick Reference)

Since you already know Vue 3, just the Nuxt-specific patterns:

```vue
<!-- components/ui/Card.vue -->
<script setup lang="ts">
// Props with TypeScript
interface Props {
  title: string
  variant?: 'default' | 'outlined' | 'elevated'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  loading: false,
})

// Emits with TypeScript
const emit = defineEmits<{
  close: []
  action: [id: string]
}>()

// Slots typing
defineSlots<{
  default: () => any
  header: (props: { title: string }) => any
  footer: () => any
}>()
</script>

<template>
  <div :class="['card', `card--${variant}`]">
    <header v-if="$slots.header" class="card-header">
      <slot name="header" :title="title" />
    </header>
    <div class="card-body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>
```

## Walkthrough

1. **Create nested components.** Build `components/ui/Button.vue`, `components/ui/Card.vue`, `components/dashboard/Stats.vue`. Use them in a page without imports. Verify names in DevTools.

2. **Test ClientOnly:**
   ```vue
   <!-- components/BrowserInfo.vue -->
   <template>
     <pre>{{ info }}</pre>
   </template>
   <script setup>
   const info = {
     width: window.innerWidth,
     userAgent: navigator.userAgent,
   }
   </script>
   ```
   Wrap in `<ClientOnly>` with a fallback. View page source — the fallback renders in SSR HTML.

3. **Add a Lazy component.** Create a large component. Use it as `<LazyLargeComponent v-if="show" />`. Check Network tab — the chunk loads only when `show` becomes true.

4. **Configure custom directories.** Add a `~/ui` directory with `pathPrefix: false` in config. Verify components from that dir have no prefix.

## Gotchas

- **Component names are PascalCase of their full path.** `components/ui/nav/DropdownMenu.vue` → `<UiNavDropdownMenu>`. Long paths = long names. Restructure or use `pathPrefix: false` to shorten.
- **ClientOnly children still ship JS to the client.** `<ClientOnly>` just skips SSR rendering — the component's JavaScript is still in the client bundle. It's NOT a way to exclude code from the bundle. For that, use `.server.vue`.
- **Lazy ≠ viewport-triggered.** `<LazyComponent>` loads when rendered, not when scrolled into view. It's code-splitting, not lazy loading in the image/intersection-observer sense. Combine with `v-if` and IntersectionObserver for true lazy loading.
- **Server components have no client-side events.** No `@click`, no `v-model`. If you need a button inside a server component, that button must come from a client component passed via slots.
- **Don't mix auto-import and explicit import.** If you `import Button from '~/components/ui/Button.vue'` AND `<UiButton>` appears in templates, you'll have two instances. Pick one approach per component.
- **`components/` scan is recursive by default.** A deeply nested structure generates long names. Consider flatter structures or `pathPrefix: false` for specific directories.
- **Global registration defeats tree-shaking.** `{ global: true }` in component config means the component is bundled even if unused. Only globalize components that are genuinely used everywhere (icons, app shell parts).
- **`.client.vue` and `.server.vue` can coexist.** You can have `Counter.client.vue` (interactive version) and `Counter.server.vue` (static SSR fallback). Nuxt picks the right one based on context.

## Exercise

Build a dashboard page with:

1. **`<AppNav>`** — always rendered, shows on all pages (regular component)
2. **`<DashboardChart>`** — uses a charting library that needs `window`. Wrap in `<ClientOnly>` with a skeleton fallback matching chart dimensions.
3. **`<LazyDataTable>`** — a heavy data table component (200+ rows). Load lazily with a "Show Table" toggle button.
4. **`<SiteFooter>`** — completely static content, no interactivity needed. Make it a `.server.vue` component.
5. **Configure two component directories:**
   - `~/components` (default, with path prefix)
   - `~/components/ui` (no path prefix — `Button.vue` → `<Button>`)

Verify in DevTools: which components have client-side JS and which are server-rendered HTML only.

## Further Reading

- [Components Directory](https://nuxt.com/docs/4.x/guide/directory-structure/components)
- [ClientOnly Component](https://nuxt.com/docs/4.x/api/components/client-only)
- [Component Islands](https://nuxt.com/docs/4.x/guide/going-further/component-islands)
- [Lazy Components](https://nuxt.com/docs/4.x/guide/directory-structure/components#dynamic-imports)
