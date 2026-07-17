# Chapter 14 — Testing

## What changed from previous chapters

### Testing infrastructure

- **vitest** — test runner, configured via `vitest.config.ts`
- **@nuxt/test-utils** — Nuxt-aware test environment and helpers
- **@vue/test-utils** — low-level Vue component mounting (used internally by `mountSuspended`)
- **happy-dom** — lightweight DOM implementation for the Nuxt test environment

### vitest.config.ts

Uses `defineVitestConfig` from `@nuxt/test-utils/config` to set up the `nuxt` test environment. This gives tests access to auto-imports, composables, and Nuxt context without manual setup.

### Unit tests (`tests/unit/`)

Pure function tests that don't need the Nuxt environment. `slugify.test.ts` demonstrates straightforward input/output testing with `describe`, `it`, and `expect`.

### Component tests (`tests/components/`)

`UserCard.test.ts` demonstrates two key `@nuxt/test-utils/runtime` utilities:

- **`mountSuspended`** — mounts a Nuxt component inside a proper Nuxt context (auto-imports, plugins, Suspense boundary). Returns a `@vue/test-utils` wrapper.
- **`mockNuxtImport`** — replaces an auto-imported composable (`useFetch`) with a mock implementation. Must be called at the top level of the test file (hoisted by the Nuxt test plugin).

### Scripts

- `npm test` / `yarn test` — runs vitest in watch mode
- `npm run test:run` / `yarn test:run` — single run (CI-friendly)

### Key patterns

| Pattern | Where |
|---------|-------|
| Pure unit tests (no Nuxt context needed) | `tests/unit/` |
| Component tests with mocked composables | `tests/components/` |
| `data-testid` attributes for reliable selectors | `components/UserCard.vue`, `pages/index.vue` |
| Mock auto-imports via `mockNuxtImport` | `tests/components/UserCard.test.ts` |
