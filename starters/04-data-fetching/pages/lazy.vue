<script setup lang="ts">
const { data: posts, status } = useFetch('/api/posts', { lazy: true })
</script>

<template>
  <div>
    <h1>Posts (Lazy Fetch)</h1>
    <p>This page renders immediately, data loads client-side.</p>
    <p v-if="status === 'pending'">Loading posts...</p>
    <ul v-else-if="posts">
      <li v-for="post in posts" :key="post.id">
        {{ post.title }}
      </li>
    </ul>
  </div>
</template>
