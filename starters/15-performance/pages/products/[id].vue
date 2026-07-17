<script setup lang="ts">
const route = useRoute()

// --- Transform: reduce payload to only what the template needs ---
// The API returns 15+ fields but this page only renders a few.
// `transform` runs server-side during SSR so the full response never hits the client payload.

// --- getCachedData: instant back-navigation ---
// When user navigates away and comes back within 30s, the cached data is used instantly
// without a loading state. After 30s it's considered stale and refetches.

const { data: product } = await useFetch(`/api/products/${route.params.id}`, {
  key: `product-${route.params.id}`,
  transform: (data) => ({
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    rating: data.rating,
    stock: data.stock,
  }),
  getCachedData(key, nuxtApp) {
    const cached = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
    if (!cached) return undefined

    // Check if data is stale (30 seconds)
    const fetchedAt = nuxtApp.payload._fetchedAt?.[key]
    if (fetchedAt && Date.now() - fetchedAt > 30_000) {
      return undefined // stale — refetch
    }

    return cached
  },
})
</script>

<template>
  <div>
    <NuxtLink to="/" style="color: #818cf8; text-decoration: none; display: inline-block; margin-bottom: 1rem;">
      ← Back to Products
    </NuxtLink>

    <div v-if="product" style="max-width: 600px;">
      <h1>{{ product.name }}</h1>

      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <span style="background: #2a2a3e; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem;">
          {{ product.category }}
        </span>
        <span style="color: #facc15;">
          ⭐ {{ product.rating }}
        </span>
        <span style="color: #aaa;">
          Stock: {{ product.stock }}
        </span>
      </div>

      <p style="font-size: 2rem; color: #4ade80; margin: 1rem 0;">
        ${{ product.price.toFixed(2) }}
      </p>

      <p style="color: #ccc; line-height: 1.6;">
        {{ product.description }}
      </p>

      <div style="margin-top: 2rem; padding: 1rem; background: #1e1e2e; border-radius: 8px; border: 1px solid #444;">
        <h3 style="margin: 0 0 0.5rem;">💡 Performance Notes</h3>
        <ul style="color: #aaa; margin: 0; padding-left: 1.2rem; line-height: 1.8;">
          <li><code>transform</code> reduced payload from ~15 fields to 7</li>
          <li><code>getCachedData</code> returns instantly on back-navigation (30s TTL)</li>
          <li>Navigate away and back quickly — no loading flash!</li>
        </ul>
      </div>
    </div>

    <div v-else>
      <p>Product not found.</p>
    </div>
  </div>
</template>
