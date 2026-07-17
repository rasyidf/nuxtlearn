<script setup lang="ts">
const { items, total, count, removeItem, clear } = useCart()
</script>

<template>
  <div>
    <h1>Cart</h1>

    <p v-if="count === 0">Your cart is empty. <NuxtLink to="/products">Browse products →</NuxtLink></p>

    <template v-else>
      <ul style="list-style: none; padding: 0;">
        <li
          v-for="item in items"
          :key="item.id"
          style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;"
        >
          <span>{{ item.name }} × {{ item.quantity }} — ${{ (item.price * item.quantity).toFixed(2) }}</span>
          <button @click="removeItem(item.id)">Remove</button>
        </li>
      </ul>

      <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <strong>Total: ${{ total.toFixed(2) }}</strong>
        <button @click="clear()">Clear Cart</button>
      </div>
    </template>
  </div>
</template>
