<script setup lang="ts">
// --- Payload Optimization with `pick` ---
// Without `pick`, the entire 20-product array (with ALL fields) gets serialized
// into the SSR payload. With `pick`, only id/name/price cross the wire.
const { data: products } = await useFetch('/api/products', {
  key: 'products-list',
  pick: ['id', 'name', 'price'] as never,
  transform: (data) => data.map(({ id, name, price }) => ({ id, name, price })),
})

// --- useNuxtData: Access cached fetch data ---
// Any component can access previously fetched data by key without re-fetching.
// This is useful for sharing data between components or showing stale data instantly.
const { data: cachedProducts } = useNuxtData('products-list')

// --- Code Splitting with Lazy prefix ---
// <LazyHeavyChart> is only loaded when showChart is true.
// The component chunk is split from the main bundle.
const showChart = ref(false)
</script>

<template>
  <div>
    <h1>Chapter 15: Performance</h1>

    <!-- Payload Optimization -->
    <section style="margin-bottom: 2rem;">
      <h2>🎯 Payload Optimization (pick + transform)</h2>
      <p style="color: #aaa; margin-bottom: 1rem;">
        The API returns 20 products with 15+ fields each. Using <code>pick</code> and
        <code>transform</code>, we only send <strong>id, name, price</strong> in the SSR payload.
        Open DevTools → Network → view the page source to see the reduced <code>__NUXT_DATA__</code>.
      </p>

      <ProductList v-if="products" :products="products" />
    </section>

    <!-- useNuxtData -->
    <section style="margin-bottom: 2rem;">
      <h2>📦 useNuxtData (Shared Cache)</h2>
      <p style="color: #aaa;">
        <code>useNuxtData('products-list')</code> accesses the same cached data without a new fetch.
        Cached items: <strong>{{ cachedProducts?.length ?? 0 }}</strong>
      </p>
    </section>

    <!-- Code Splitting -->
    <section style="margin-bottom: 2rem;">
      <h2>✂️ Code Splitting (LazyHeavyChart)</h2>
      <p style="color: #aaa; margin-bottom: 1rem;">
        The chart component is prefixed with <code>Lazy</code> so it's code-split into a separate chunk.
        It only loads when toggled. Check the Network tab when you click the button.
      </p>

      <button
        style="padding: 0.5rem 1rem; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;"
        @click="showChart = !showChart"
      >
        {{ showChart ? 'Hide' : 'Show' }} Heavy Chart
      </button>

      <div v-if="showChart" style="margin-top: 1rem;">
        <LazyHeavyChart />
      </div>
    </section>
  </div>
</template>
