---
title: "Testing"
layout: chapter
nav_order: 15
parent: Home
starter: "14-testing"
official_docs:
  - https://nuxt.com/docs/4.x/getting-started/testing
---

# Testing

## TL;DR

`@nuxt/test-utils` provides Nuxt-aware testing on top of Vitest. Use `mountSuspended` for component tests (handles async setup, auto-imports, Nuxt context). Test server routes by importing handlers directly. Mock auto-imported composables with `mockNuxtImport`. Structure tests in a pyramid: unit (composables, utils) → component (mountSuspended) → integration (server routes) → E2E (browser).

## Mental Model

Testing Nuxt apps has one core challenge: **Nuxt components depend on framework context** (auto-imports, composables, plugins, async setup). A plain `mount()` from `@vue/test-utils` doesn't provide that context. `@nuxt/test-utils` bridges this gap by spinning up a Nuxt-like environment in tests.

```
Testing Pyramid:
─────────────────────────────────
   E2E (Playwright)           ← Slow, full browser
─────────────────────────────────
   Integration (server routes) ← Fast, HTTP layer
─────────────────────────────────
   Component (mountSuspended)  ← Medium, Nuxt context
─────────────────────────────────
   Unit (composables, utils)   ← Fastest, no framework
─────────────────────────────────
```

### Setup

```bash
npm install -D @nuxt/test-utils vitest @vue/test-utils
```

```typescript
// vitest.config.ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',  // Provides Nuxt context for component tests
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',  // or 'jsdom'
      },
    },
  },
})
```

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Unit Testing (Composables & Utils)

For pure logic that doesn't depend on Nuxt context:

```typescript
// utils/slugify.ts
export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')
}
```

```typescript
// tests/utils/slugify.test.ts
import { describe, it, expect } from 'vitest'
import { slugify } from '~/utils/slugify'

describe('slugify', () => {
  it('converts spaces to dashes', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world')
  })

  it('trims leading/trailing dashes', () => {
    expect(slugify(' Hello ')).toBe('hello')
  })

  it('handles empty strings', () => {
    expect(slugify('')).toBe('')
  })
})
```

These tests need no Nuxt environment — they run fast with plain Vitest.

### Component Testing with mountSuspended

For components that use Nuxt features (auto-imports, useFetch, useRoute):

```vue
<!-- components/UserCard.vue -->
<script setup lang="ts">
const props = defineProps<{ userId: number }>()
const { data: user, pending } = await useFetch(`/api/users/${props.userId}`)
</script>

<template>
  <div v-if="pending" data-testid="loading">Loading...</div>
  <div v-else-if="user" data-testid="user-card">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
  </div>
</template>
```

```typescript
// tests/components/UserCard.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import UserCard from '~/components/UserCard.vue'

// Mock useFetch before mounting
mockNuxtImport('useFetch', () => {
  return () => ({
    data: ref({ name: 'John Doe', email: 'john@example.com' }),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  })
})

describe('UserCard', () => {
  it('renders user data when loaded', async () => {
    const wrapper = await mountSuspended(UserCard, {
      props: { userId: 1 },
    })

    expect(wrapper.find('[data-testid="user-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('john@example.com')
  })

  it('shows loading state', async () => {
    mockNuxtImport('useFetch', () => {
      return () => ({
        data: ref(null),
        pending: ref(true),
        error: ref(null),
        refresh: vi.fn(),
      })
    })

    const wrapper = await mountSuspended(UserCard, {
      props: { userId: 1 },
    })

    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
  })
})
```

**`mountSuspended` vs `mount`:**
- `mountSuspended` — awaits async setup, provides Nuxt context (auto-imports, plugins)
- `mount` (from @vue/test-utils) — synchronous, no Nuxt context, no auto-imports

Always use `mountSuspended` for Nuxt components. Always `await` it.

### renderSuspended (Snapshot Testing)

Render a component to HTML string:

```typescript
import { renderSuspended } from '@nuxt/test-utils/runtime'

it('matches snapshot', async () => {
  const html = await renderSuspended(UserCard, {
    props: { userId: 1 },
  })
  expect(html).toMatchSnapshot()
})
```

### Testing Server Routes

Import the handler and invoke it directly with a mock H3 event:

```typescript
// server/api/users/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }
  return { id: Number(id), name: 'Test User' }
})
```

```typescript
// tests/server/api/users.test.ts
import { describe, it, expect } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'

// Setup a test server (spins up Nuxt in test mode)
await setup({ server: true })

describe('GET /api/users/:id', () => {
  it('returns user for valid ID', async () => {
    const user = await $fetch('/api/users/1')
    expect(user).toEqual({ id: 1, name: 'Test User' })
  })

  it('returns 400 for invalid ID', async () => {
    const error = await $fetch('/api/users/abc', {
      ignoreResponseError: true,
    }).catch(e => e.data)

    expect(error.statusCode).toBe(400)
  })
})
```

**Alternative: Direct handler invocation (faster, no server needed):**

```typescript
// tests/server/api/users.test.ts
import { describe, it, expect } from 'vitest'
import { createEvent } from 'h3'
import handler from '~/server/api/users/[id].get'

describe('users handler', () => {
  it('returns user for valid ID', async () => {
    const event = createEvent(
      new Request('http://localhost/api/users/1'),
      {}
    )
    event.context.params = { id: '1' }

    const result = await handler(event)
    expect(result).toEqual({ id: 1, name: 'Test User' })
  })
})
```

### mockNuxtImport

Mock any auto-imported function:

```typescript
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// Mock useRoute
mockNuxtImport('useRoute', () => {
  return () => ({
    params: { id: '42' },
    query: {},
    path: '/users/42',
  })
})

// Mock useState
mockNuxtImport('useState', () => {
  return (key: string, init?: () => any) => ref(init?.())
})

// Mock navigateTo
const mockNavigateTo = vi.fn()
mockNuxtImport('navigateTo', () => mockNavigateTo)
```

**Important:** `mockNuxtImport` must be called BEFORE the component that uses the import is mounted. It modifies the import resolution at the module level.

### Testing Composables

For composables that use Nuxt features, wrap in a component or use `mountSuspended`:

```typescript
// composables/useCounter.ts
export function useCounter(initial = 0) {
  const count = useState('counter', () => initial)
  const increment = () => count.value++
  return { count, increment }
}
```

```typescript
// tests/composables/useCounter.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'

describe('useCounter', () => {
  it('increments count', async () => {
    const TestComponent = defineComponent({
      setup() {
        const { count, increment } = useCounter(5)
        return { count, increment }
      },
      template: '<button @click="increment">{{ count }}</button>',
    })

    const wrapper = await mountSuspended(TestComponent)
    expect(wrapper.text()).toBe('5')

    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toBe('6')
  })
})
```

### Testing with Page Navigation

Test full page navigation behavior:

```typescript
import { describe, it, expect } from 'vitest'
import { setup, $fetch, createPage } from '@nuxt/test-utils'

await setup({ browser: true })  // Launches a browser

describe('navigation', () => {
  it('navigates to about page', async () => {
    const page = await createPage('/')
    await page.click('a[href="/about"]')
    expect(await page.url()).toContain('/about')
    expect(await page.textContent('h1')).toBe('About Us')
  })
})
```

### Test File Organization

```
tests/
├── unit/
│   ├── utils/
│   │   └── slugify.test.ts       ← Pure unit tests (fast)
│   └── composables/
│       └── useCounter.test.ts    ← Composable tests
├── components/
│   ├── UserCard.test.ts          ← Component tests (mountSuspended)
│   └── AppHeader.test.ts
├── server/
│   ├── api/
│   │   └── users.test.ts        ← Server route tests
│   └── middleware/
│       └── auth.test.ts
└── e2e/
    ├── navigation.test.ts        ← Full browser tests
    └── auth-flow.test.ts
```

### Coverage Configuration

```typescript
// vitest.config.ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    coverage: {
      provider: 'v8',
      include: [
        'components/**',
        'composables/**',
        'utils/**',
        'server/**',
      ],
      exclude: [
        'node_modules',
        '.nuxt',
        'tests',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
})
```

## Walkthrough

1. **Set up testing:**
   ```bash
   npm install -D @nuxt/test-utils vitest @vue/test-utils happy-dom
   ```
   Create `vitest.config.ts` with Nuxt environment.

2. **Write a unit test** for a utility function. Run `npm test` — verify it passes.

3. **Write a component test** with `mountSuspended`. Mock `useFetch` to control data. Test loading, success, and error states.

4. **Write a server route test.** Either use the test server `$fetch` or direct handler invocation.

5. **Add coverage.** Run `npm run test:coverage`. Check the report for untested paths.

## Gotchas

- **`mountSuspended` is async.** Always `await` it. Forgetting `await` gives you a pending promise, not a wrapper.
- **Tests with Nuxt environment are slower.** The `environment: 'nuxt'` setup takes time (spins up a virtual Nuxt app). For pure unit tests, use `// @vitest-environment node` comment at the top of the file to opt out.
- **`mockNuxtImport` must be called before mounting.** If you mock AFTER importing/mounting the component, it's too late — the real import was already resolved.
- **Auto-imports may not work in test files.** You might need to explicitly import `ref`, `computed`, `vi` in test files. Configure `vitest` to resolve auto-imports or import manually.
- **Server route tests need H3 event mocking.** Creating realistic events with params, body, headers requires building the event object correctly. Use `createEvent` from `h3`.
- **Hydration testing is hard.** `mountSuspended` simulates client-side rendering. To test SSR + hydration behavior, use the full test server with `setup({ server: true })` and compare HTML output vs hydrated DOM.
- **Component tests don't run middleware.** `mountSuspended` renders the component in isolation. Route middleware, layouts, and page transitions don't execute. Test those separately or use E2E tests.
- **Snapshot tests break often.** Any minor markup change breaks the snapshot. Use them sparingly — for stable, well-defined components. Prefer assertion-based tests for evolving components.
- **Environment conflicts.** If you mix `environment: 'nuxt'` and `environment: 'node'` tests in the same suite, use per-file environment comments or split into separate vitest workspaces.

## Exercise

Write tests achieving >80% coverage on these files:

1. **Unit test** — `utils/formatCurrency.ts`:
   - Test various currencies (USD, EUR, IDR)
   - Test edge cases (0, negative, very large numbers)

2. **Component test** — a component that fetches and displays a user list:
   - Mock `useFetch` to return test data
   - Test loading state renders skeleton
   - Test success state renders user names
   - Test error state renders error message + retry button
   - Test retry button calls `refresh()`

3. **Server route test** — `GET /api/notes/[id]`:
   - Test valid ID returns note
   - Test invalid ID returns 400
   - Test non-existent ID returns 404
   - Test without auth returns 401 (if auth middleware exists)

4. **Run coverage:** `npm run test:coverage` — verify >80% across tested files.

## Further Reading

- [Nuxt Testing Guide](https://nuxt.com/docs/4.x/getting-started/testing)
- [Vitest Documentation](https://vitest.dev)
- [@vue/test-utils](https://test-utils.vuejs.org)
- [@nuxt/test-utils API](https://nuxt.com/docs/4.x/getting-started/testing#api)
