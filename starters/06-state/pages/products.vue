<script setup lang="ts">
const { addItem } = useCart()

const products = [
  { id: 1, name: 'Wireless Keyboard', price: 59.99 },
  { id: 2, name: 'USB-C Hub', price: 34.99 },
  { id: 3, name: 'Monitor Stand', price: 45.00 },
  { id: 4, name: 'Webcam HD', price: 79.99 },
  { id: 5, name: 'Desk Lamp', price: 29.99 },
]
</script>

<template>
  <div>
    <h1>Products</h1>
    <ul style="list-style: none; padding: 0;">
      <li
        v-for="product in products"
        :key="product.id"
        style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;"
      >
        <span>{{ product.name }} — ${{ product.price.toFixed(2) }}</span>
        <button @click="addItem(product)">Add to Cart</button>
      </li>
    </ul>
  </div>
</template>
