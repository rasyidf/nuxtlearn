<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div>
    <h1>Post {{ route.params.id }}</h1>
    <p>Dynamic route parameter: <code>{{ route.params.id }}</code></p>
    <NuxtLink to="/posts">← Back to posts</NuxtLink>
  </div>
</template>
