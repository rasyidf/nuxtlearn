<script setup lang="ts">
const { data: items, refresh } = await useFetch('/api/items')
const newName = ref('')

async function addItem() {
  if (!newName.value) return
  await $fetch('/api/items', {
    method: 'POST',
    body: { name: newName.value },
  })
  newName.value = ''
  refresh()
}

async function removeItem(id: number) {
  await $fetch(`/api/items/${id}`, { method: 'DELETE' })
  refresh()
}
</script>

<template>
  <div>
    <h1>Items (CRUD)</h1>
    <form @submit.prevent="addItem">
      <input v-model="newName" placeholder="New item name" />
      <button type="submit">Add</button>
    </form>
    <ul>
      <li v-for="item in items" :key="item.id">
        <NuxtLink :to="`/items/${item.id}`">{{ item.name }}</NuxtLink>
        <button @click="removeItem(item.id)">×</button>
      </li>
    </ul>
  </div>
</template>
