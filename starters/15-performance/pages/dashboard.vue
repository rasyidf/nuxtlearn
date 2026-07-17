<script setup lang="ts">
// --- Parallel Data Fetching with useAsyncData ---
// When a page needs multiple API calls, don't await them sequentially.
// Use useAsyncData with Promise.all to fetch in parallel — total time = max(all calls)
// instead of sum(all calls).

const { data } = await useAsyncData('dashboard', async () => {
  const [products, stats] = await Promise.all([
    $fetch('/api/products'),
    // Simulate a stats endpoint by deriving from products
    $fetch('/api/products').then((prods) => ({
      totalProducts: prods.length,
      averagePrice: Math.round(prods.reduce((sum, p) => sum + p.price, 0) / prods.length * 100) / 100,
      totalStock: prods.reduce((sum, p) => sum + p.stock, 0),
      categories: [...new Set(prods.map((p) => p.category))],
      topRated: prods.sort((a, b) => b.rating - a.rating).slice(0, 3),
    })),
  ])

  // Transform: only return what the template needs
  return {
    productCount: products.length,
    stats,
  }
})
</script>

<template>
  <div>
    <h1>Dashboard</h1>
    <p style="color: #aaa; margin-bottom: 2rem;">
      Demonstrates parallel data fetching with <code>useAsyncData</code> + <code>Promise.all</code>.
      Both API calls execute simultaneously instead of sequentially.
    </p>

    <div v-if="data" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
      <div style="padding: 1.5rem; background: #1e1e2e; border-radius: 8px; border: 1px solid #444;">
        <p style="color: #aaa; font-size: 0.85rem; margin: 0 0 0.5rem;">Total Products</p>
        <p style="font-size: 2rem; margin: 0; color: #818cf8;">{{ data.stats.totalProducts }}</p>
      </div>

      <div style="padding: 1.5rem; background: #1e1e2e; border-radius: 8px; border: 1px solid #444;">
        <p style="color: #aaa; font-size: 0.85rem; margin: 0 0 0.5rem;">Average Price</p>
        <p style="font-size: 2rem; margin: 0; color: #4ade80;">${{ data.stats.averagePrice }}</p>
      </div>

      <div style="padding: 1.5rem; background: #1e1e2e; border-radius: 8px; border: 1px solid #444;">
        <p style="color: #aaa; font-size: 0.85rem; margin: 0 0 0.5rem;">Total Stock</p>
        <p style="font-size: 2rem; margin: 0; color: #facc15;">{{ data.stats.totalStock }}</p>
      </div>

      <div style="padding: 1.5rem; background: #1e1e2e; border-radius: 8px; border: 1px solid #444;">
        <p style="color: #aaa; font-size: 0.85rem; margin: 0 0 0.5rem;">Categories</p>
        <p style="font-size: 2rem; margin: 0; color: #f472b6;">{{ data.stats.categories.length }}</p>
      </div>
    </div>

    <!-- Top Rated -->
    <div v-if="data?.stats.topRated">
      <h2>⭐ Top Rated Products</h2>
      <ul style="list-style: none; padding: 0;">
        <li
          v-for="product in data.stats.topRated"
          :key="product.id"
          style="padding: 0.75rem 1rem; border: 1px solid #444; border-radius: 6px; margin-bottom: 0.5rem; background: #1e1e2e; display: flex; justify-content: space-between; align-items: center;"
        >
          <NuxtLink :to="`/products/${product.id}`" style="color: #e0e0e0; text-decoration: none;">
            {{ product.name }}
          </NuxtLink>
          <span style="color: #facc15;">⭐ {{ product.rating }}</span>
        </li>
      </ul>
    </div>

    <!-- Performance Notes -->
    <div style="margin-top: 2rem; padding: 1rem; background: #1e1e2e; border-radius: 8px; border: 1px solid #444;">
      <h3 style="margin: 0 0 0.5rem;">💡 Performance Pattern</h3>
      <pre style="color: #aaa; font-size: 0.85rem; margin: 0; white-space: pre-wrap;">// ❌ Sequential — total time = call1 + call2
const { data: a } = await useFetch('/api/a')
const { data: b } = await useFetch('/api/b')

// ✅ Parallel — total time = max(call1, call2)
const { data } = await useAsyncData('key', () =>
  Promise.all([$fetch('/api/a'), $fetch('/api/b')])
)</pre>
    </div>
  </div>
</template>
