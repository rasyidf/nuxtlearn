<script setup lang="ts">
const props = defineProps<{
  userId: number
}>()

const { data: user, pending, error } = useFetch(`/api/users/${props.userId}`)
</script>

<template>
  <div data-testid="user-card">
    <p v-if="pending" data-testid="user-loading">Loading...</p>
    <p v-else-if="error" data-testid="user-error">{{ error.message }}</p>
    <div v-else-if="user" data-testid="user-data">
      <h2 data-testid="user-name">{{ user.name }}</h2>
      <p data-testid="user-email">{{ user.email }}</p>
    </div>
  </div>
</template>
