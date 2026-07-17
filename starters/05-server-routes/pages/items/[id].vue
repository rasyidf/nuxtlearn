<script setup lang="ts">
const route = useRoute()
const { data: item } = await useFetch(`/api/items/${route.params.id}`)
</script>

<template>
  <div>
    <NuxtLink to="/">← Back</NuxtLink>
    <div v-if="item">
      <h1>{{ item.name }}</h1>
      <p>Created: {{ item.createdAt }}</p>
    </div>
  </div>
</template>
