<script setup lang="ts">
const { data: posts, status } = await useFetch('/api/posts')
</script>

<template>
  <div>
    <h1>Posts (useFetch)</h1>
    <p v-if="status === 'pending'">Loading...</p>
    <ul v-else>
      <li v-for="post in posts" :key="post.id">
        <strong>{{ post.title }}</strong> — {{ post.excerpt }}
      </li>
    </ul>
  </div>
</template>
