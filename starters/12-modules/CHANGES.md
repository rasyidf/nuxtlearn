# Changes from Previous Starter

## What's New in Chapter 12: Modules & Plugins

### Plugins

Nuxt plugins run once when the app initializes. They can extend the runtime context, register hooks, and provide helpers to the entire application.

#### Provide Pattern (`plugins/toast.client.ts`)

- Use `return { provide: { key: value } }` to inject helpers into the Nuxt app context.
- Accessible everywhere via `useNuxtApp().$toast` (or destructured).
- The toast plugin demonstrates reactive state (`ref`) managed inside a plugin and exposed to components.

#### Client-Only Plugins (`.client.ts` suffix)

- Files named `*.client.ts` only run in the browser — never during SSR.
- `toast.client.ts` and `analytics.client.ts` use this pattern because they depend on browser APIs (DOM, `setTimeout`, `console` in page context).
- Server-only equivalent: `*.server.ts`.

#### Runtime Hooks (`plugins/analytics.client.ts`, `plugins/error-handler.ts`)

- Plugins can hook into Nuxt and Vue lifecycle events via `nuxtApp.hook()`.
- `page:finish` — fires after every client-side navigation completes.
- `vue:error` — global error boundary, catches unhandled errors in any component.
- Full hook list: https://nuxt.com/docs/api/advanced/hooks

### Local Modules (`modules/build-info.ts`)

- Place `.ts` files in the `modules/` directory — Nuxt auto-discovers them.
- Alternatively, register explicitly in `nuxt.config.ts` → `modules: ['~/modules/build-info']`.
- Modules run at **build time** (not runtime) and can:
  - Hook into the Nuxt build lifecycle (`ready`, `build:before`, `close`, etc.)
  - Add plugins, components, composables programmatically via `@nuxt/kit`
  - Modify `nuxt.options` before the app starts
- Use `defineNuxtModule` from `@nuxt/kit` for type-safe module definitions.

### `useNuxtApp()`

- The composable that gives access to the runtime Nuxt instance.
- Use it in components/composables to access `$toast`, `$router`, hooks, and any provided values.
- Only available in Vue setup context or plugin code.

### File Structure

```
plugins/
  toast.client.ts       → client-only, provides $toast
  analytics.client.ts   → client-only, page:finish hook
  error-handler.ts      → universal, vue:error hook
modules/
  build-info.ts         → local build-time module
components/
  ToastContainer.vue    → renders toasts from $toast.toasts
```
