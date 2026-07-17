---
title: "Layouts & Views"
layout: chapter
nav_order: 4
parent: Home
starter: "03-layouts"
official_docs:
  - https://nuxt.com/docs/4.x/getting-started/views
  - https://nuxt.com/docs/4.x/directory-structure/layouts
---

# Layouts & Views

## TL;DR

Layouts wrap pages with shared UI (nav, footer, sidebar). The default layout applies automatically; named layouts are assigned via `definePageMeta({ layout: 'admin' })`. Layouts sit between `app.vue` and your page components. They must contain a `<slot />` and must have a single root element. Layout changes trigger a full re-render of the page content.

## Mental Model

The rendering hierarchy:

```
app.vue
  └── <NuxtLayout>          ← picks the right layout
        └── layouts/X.vue    ← shared UI frame
              └── <slot />
                    └── <NuxtPage>   ← renders matched route
                          └── pages/Y.vue  ← your page content
```

Think of layouts as picture frames. You swap the frame (layout) independently from the picture (page). A dashboard page gets the sidebar frame. A login page gets the minimal centered frame. The content inside is unaware of which frame wraps it.

**Layouts are NOT components you import.** They're a routing-level concept. Nuxt picks the layout based on the current route's `definePageMeta`, renders it, and puts your page inside the slot. You don't `<DashboardLayout>` yourself — that's a wrapper component pattern (different, covered below).

### Default Layout

Create `layouts/default.vue` and it automatically wraps every page:

```vue
<!-- layouts/default.vue -->
<template>
  <div class="layout-default">
    <header>
      <nav>
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
        <NuxtLink to="/dashboard">Dashboard</NuxtLink>
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <footer>
      <p>&copy; 2026 My App</p>
    </footer>
  </div>
</template>
```

**The `<slot />` is mandatory.** Without it, your page content has nowhere to render. Nuxt won't warn you — you'll just see an empty page area.

**Single root element required.** Layouts must have one root element wrapping everything. Multi-root templates (`<header />` + `<main />` + `<footer />` without a wrapper) break layout transitions. Wrap in a `<div>`.

### Named Layouts

Create additional layouts for different page contexts:

```vue
<!-- layouts/auth.vue — minimal, centered layout for login/register -->
<template>
  <div class="layout-auth">
    <div class="auth-card">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.layout-auth {
  min-height: 100vh;
  display: grid;
  place-items: center;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}
</style>
```

```vue
<!-- layouts/dashboard.vue — sidebar + content area -->
<template>
  <div class="layout-dashboard">
    <aside class="sidebar">
      <NuxtLink to="/dashboard">Overview</NuxtLink>
      <NuxtLink to="/dashboard/settings">Settings</NuxtLink>
      <NuxtLink to="/dashboard/users">Users</NuxtLink>
    </aside>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout-dashboard {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-right: 1px solid #eee;
}
.content {
  flex: 1;
  padding: 2rem;
}
</style>
```

Assign a named layout to a page:

```vue
<!-- pages/login.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <form>
    <h1>Login</h1>
    <input type="email" placeholder="Email" />
    <input type="password" placeholder="Password" />
    <button type="submit">Sign In</button>
  </form>
</template>
```

Layout names map to filenames: `layouts/dashboard.vue` → `layout: 'dashboard'`. Kebab-case filenames use camelCase in meta: `layouts/admin-panel.vue` → `layout: 'admin-panel'`.

### Disabling Layouts

Some pages need no layout at all (full-screen editors, embedded widgets):

```vue
<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>
```

When `layout: false`, your page renders directly inside `<NuxtLayout>` with no wrapper. The page IS the entire viewport.

### NuxtLayout in app.vue

Your `app.vue` must include the layout outlet:

```vue
<!-- app.vue -->
<template>
  <div>
    <!-- Anything here wraps ALL layouts -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
```

Note the nesting: `<NuxtLayout>` wraps `<NuxtPage>`. The layout receives the page via its slot. You can also put app-wide elements outside `<NuxtLayout>` (global toast notifications, modals, loading bars) — they persist across all layout/page changes.

### Layout Transitions

Nuxt supports transitions when switching between layouts:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
})
```

```css
/* assets/css/transitions.css */
.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.3s ease;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
```

The `mode: 'out-in'` ensures the old layout fades out before the new one fades in (prevents layout overlap/flicker).

You can also set per-page transitions:

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  layoutTransition: { name: 'slide', mode: 'out-in' },
})
</script>
```

### Page Transitions

Separate from layout transitions, you can animate page changes within the same layout:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})
```

```css
.page-enter-active,
.page-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
```

Layout transitions fire when the layout changes. Page transitions fire when the page changes (within the same or different layout).

### Layouts vs Wrapper Components

Two patterns that look similar but serve different purposes:

**Layouts** (route-level, automatic):
- Defined in `layouts/` directory
- Selected via `definePageMeta`
- Managed by Nuxt's routing system
- One active at a time per route
- Support transitions
- Cannot receive props from pages

**Wrapper components** (composition, manual):
- Regular components in `components/`
- Imported/used explicitly in templates
- You control rendering
- Multiple can nest
- No built-in transition integration
- Receive props, emit events

Use layouts when the structure is route-determined (public vs admin vs auth). Use wrapper components when you need composable UI pieces within pages (card wrappers, section containers, form layouts).

```vue
<!-- components/PageSection.vue — wrapper component, NOT a layout -->
<template>
  <section class="page-section">
    <h2 v-if="$slots.title"><slot name="title" /></h2>
    <slot />
  </section>
</template>
```

```vue
<!-- pages/about.vue — uses default layout + wrapper components -->
<template>
  <PageSection>
    <template #title>About Us</template>
    <p>Content here</p>
  </PageSection>
  <PageSection>
    <template #title>Team</template>
    <p>Team content</p>
  </PageSection>
</template>
```

### Dynamic Layouts

You can change layouts at runtime using `setPageLayout()`:

```vue
<script setup lang="ts">
const toggleLayout = () => {
  setPageLayout('dashboard')
}
</script>
```

This is useful for scenarios like toggling a compact/expanded view, or switching to a presentation mode. However, it triggers a full re-render of the slot content — component state resets.

## Walkthrough

Open the `03-layouts` starter:

```bash
cd starters/03-layouts
npm install
npm run dev
```

1. **Explore the layouts.** Check `layouts/default.vue` and `layouts/dashboard.vue` — note the `<slot />` in each.
2. **Navigate between layouts.** Click links that switch between pages using different layouts. Watch the DOM structure change in DevTools.
3. **Check definePageMeta.** Open `pages/dashboard.vue` — see how it selects the dashboard layout.
4. **Add a layout transition.** In `nuxt.config.ts`, add `app: { layoutTransition: { name: 'fade', mode: 'out-in' } }`. Add the CSS classes. Navigate between default and dashboard pages.
5. **Try `layout: false`.** Create a `pages/fullscreen.vue` with `layout: false` — verify it renders without any wrapper.

## Gotchas

- **Single root element.** Layouts need one root element. Multi-root templates break transitions and can cause hydration mismatches. Always wrap in a `<div>`.
- **Layout changes reset page state.** When you navigate from a `default` layout page to a `dashboard` layout page, the layout component unmounts and remounts. Any state in the layout (sidebar open/closed, scroll position) resets. Use `useState()` or Pinia to persist cross-layout state.
- **`layout: false` disables ALL layouts.** Not just the default. The page renders bare inside `<NuxtLayout>` with no wrapper at all.
- **Layouts are NOT app.vue.** `app.vue` wraps everything including layouts. If you need something truly global (a toast system, a modal portal), put it in `app.vue` outside `<NuxtLayout>`.
- **Named slots don't work.** Layouts only support the default `<slot />`. You can't define `<slot name="sidebar" />` in a layout and fill it from a page. If you need that pattern, use wrapper components instead.
- **Layout name must match filename exactly.** `layouts/AdminPanel.vue` is `layout: 'AdminPanel'` — but convention is kebab-case: `layouts/admin-panel.vue` → `layout: 'admin-panel'`.
- **Don't over-layout.** If you have 8 layouts, you're probably doing it wrong. Most apps need 2-3: default, auth, and maybe admin. Beyond that, use wrapper components for variation within a layout.

## Exercise

1. Create three layouts:
   - `default` — header with nav links + main content area + footer
   - `auth` — centered card, no nav, minimal branding
   - `dashboard` — collapsible sidebar (use a ref for open/closed state) + top bar + content

2. Create pages that use each layout:
   - `/` and `/about` use default
   - `/login` and `/register` use auth
   - `/dashboard` and `/dashboard/settings` use dashboard

3. Add a smooth fade transition when switching between layouts (`layoutTransition` in config).

4. Add a page transition (slide) for navigation within the same layout.

5. Observe: when you navigate from `/dashboard` to `/login` (layout change), does the sidebar state persist? How would you fix this?

## Further Reading

- [Views Guide](https://nuxt.com/docs/4.x/getting-started/views)
- [Layouts Directory](https://nuxt.com/docs/4.x/directory-structure/layouts)
- [NuxtLayout Component](https://nuxt.com/docs/4.x/api/components/nuxt-layout)
- [Page Transitions](https://nuxt.com/docs/4.x/getting-started/transitions)
