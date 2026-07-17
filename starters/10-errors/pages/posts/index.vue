<script setup lang="ts">
const { data: posts, status } = await useFetch('/api/posts')
</script>

<template>
  <div>
    <h1>Posts</h1>

    <p v-if="status === 'pending'">Loading posts...</p>

    <ul v-else-if="posts">
      <li v-for="post in posts" :key="post.id">
        <NuxtLink :to="`/posts/${post.id}`">{{ post.title }}</NuxtLink>
      </li>
    </ul>

    <p>
      <em>Try visiting <NuxtLink to="/posts/99">/posts/99</NuxtLink> for a 404 error.</em>
    </p>
  </div>
</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 0.5rem 0;
}

li a {
  color: #3182ce;
  text-decoration: none;
}

li a:hover {
  text-decoration: underline;
}
</style>
