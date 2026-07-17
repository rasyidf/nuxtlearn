<script setup lang="ts">
interface Product {
  id: number
  name: string
  price: number
}

defineProps<{
  products: Product[]
}>()
</script>

<template>
  <div>
    <ul style="list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
      <li
        v-for="product in products"
        :key="product.id"
        style="padding: 1rem; border: 1px solid #444; border-radius: 8px; background: #1e1e2e;"
      >
        <NuxtLink
          :to="`/products/${product.id}`"
          style="text-decoration: none; color: inherit;"
        >
          <h3 style="margin: 0 0 0.5rem;">{{ product.name }}</h3>
          <p style="color: #4ade80; font-size: 1.25rem; margin: 0;">
            ${{ product.price.toFixed(2) }}
          </p>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
