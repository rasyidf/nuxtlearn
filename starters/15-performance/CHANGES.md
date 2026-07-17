# Changes from Previous Chapter

## Chapter 15: Performance

This starter demonstrates Nuxt performance optimization techniques — reducing payload size, code-splitting components, caching fetched data, and analyzing bundles.

---

### What's New

#### 1. Payload Optimization (`pick` + `transform`)

**Problem:** SSR serializes all fetched data into `__NUXT_DATA__` in the HTML. A 20-product response with 15+ fields each bloats the initial page load.

**Solution:**
- `pick` — selects top-level keys from the response (shallow)
- `transform` — reshapes data before it's serialized to the payload (flexible)

```ts
// Only id, name, price cross the SSR → client boundary
const { data } = await useFetch('/api/products', {
  transform: (data) => data.map(({ id, name, price }) => ({ id, name, price })),
})
```

#### 2. Code-Splitting with `Lazy` Prefix

**Problem:** Heavy components (charts, editors, maps) increase the initial JS bundle even if the user never interacts with them.

**Solution:** Prefix component name with `Lazy` — Nuxt auto-generates a dynamic import. The component chunk only loads when rendered.

```vue
<!-- Only fetches HeavyChart.vue chunk when showChart is true -->
<LazyHeavyChart v-if="showChart" />
```

#### 3. `getCachedData` for Instant Back-Navigation

**Problem:** Navigating back to a previously visited page triggers a full refetch, causing loading flashes.

**Solution:** `getCachedData` returns previously fetched data instantly. Implement a staleness check to refetch after a TTL.

```ts
const { data } = await useFetch(`/api/products/${id}`, {
  getCachedData(key, nuxtApp) {
    const cached = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
    if (!cached) return undefined
    const fetchedAt = nuxtApp.payload._fetchedAt?.[key]
    if (fetchedAt && Date.now() - fetchedAt > 30_000) return undefined
    return cached
  },
})
```

#### 4. `useNuxtData` for Shared Cache Access

**Problem:** Multiple components need the same data but you don't want to refetch or prop-drill.

**Solution:** `useNuxtData(key)` gives reactive access to any previously fetched data by its cache key.

```ts
// Any component can read the products cache without fetching
const { data: products } = useNuxtData('products-list')
```

#### 5. Parallel Data Fetching

**Problem:** Sequential `await useFetch()` calls create a waterfall — each waits for the previous to complete.

**Solution:** Use `useAsyncData` with `Promise.all` and `$fetch` to execute requests in parallel.

```ts
const { data } = await useAsyncData('dashboard', () =>
  Promise.all([$fetch('/api/products'), $fetch('/api/stats')])
)
```

#### 6. Payload Extraction (`experimental.payloadExtraction`)

Enabled in `nuxt.config.ts`. During static generation, extracted payloads are stored as separate files and loaded on-demand instead of being inlined in every HTML page. Reduces HTML size for statically generated sites.

```ts
// nuxt.config.ts
experimental: {
  payloadExtraction: true,
}
```

#### 7. Bundle Analysis with `nuxi analyze`

Run `npx nuxi analyze` (or `npm run analyze`) to visualize your production bundle. Identifies:
- Large dependencies to lazy-load or replace
- Duplicated modules
- Chunks that could be split further

```bash
npm run analyze
# Opens an interactive treemap of your production build
```

---

### Files Added

| File | Purpose |
|------|---------|
| `server/api/products.get.ts` | Heavy API (20 products, 15+ fields) |
| `server/api/products/[id].get.ts` | Single product endpoint |
| `components/HeavyChart.vue` | Simulates a heavy library (code-split target) |
| `components/ProductList.vue` | Lightweight product grid |
| `pages/index.vue` | pick/transform, useNuxtData, LazyHeavyChart |
| `pages/products/[id].vue` | transform + getCachedData |
| `pages/dashboard.vue` | Parallel fetching with Promise.all |
| `layouts/default.vue` | Nav header |

---

### Key Takeaways

1. **Measure first** — run `nuxi analyze` before optimizing
2. **Reduce payloads** — only ship what the template needs via `pick`/`transform`
3. **Split code** — prefix with `Lazy` for components not needed on initial render
4. **Cache aggressively** — `getCachedData` eliminates redundant fetches on navigation
5. **Fetch in parallel** — never sequentially `await` independent requests
