<script setup lang="ts">
const counter = useCounterStore()
const { count: cartCount } = useCart()
</script>

<template>
  <div>
    <h1>Chapter 06 — State Management</h1>

    <section style="margin-top: 2rem;">
      <h2>Pinia Counter Store</h2>
      <p>Count: <strong>{{ counter.count }}</strong></p>
      <p>Doubled: <strong>{{ counter.doubled }}</strong></p>
      <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
        <button @click="counter.decrement()">−</button>
        <button @click="counter.increment()">+</button>
        <button @click="counter.reset()">Reset</button>
      </div>
    </section>

    <section style="margin-top: 2rem;">
      <h2>Cart (useState)</h2>
      <p>Items in cart: <strong>{{ cartCount }}</strong></p>
      <p>
        <NuxtLink to="/products">Browse products →</NuxtLink>
      </p>
    </section>
  </div>
</template>
