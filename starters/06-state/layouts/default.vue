<script setup lang="ts">
const { count } = useCart()
</script>

<template>
  <div>
    <header style="display: flex; align-items: center; gap: 1.5rem; padding: 1rem 2rem; border-bottom: 1px solid #e5e7eb;">
      <nav style="display: flex; gap: 1rem;">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/products">Products</NuxtLink>
        <NuxtLink to="/cart">Cart ({{ count }})</NuxtLink>
      </nav>
    </header>
    <main style="padding: 2rem;">
      <slot />
    </main>
  </div>
</template>
