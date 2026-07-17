<script setup lang="ts">
const route = useRoute()

const { data: post, error, refresh } = await useFetch(`/api/posts/${route.params.id}`)
</script>

<template>
  <div>
    <div v-if="error" class="error-inline">
      <h2>Post not found</h2>
      <p>{{ error.statusMessage || 'The requested post does not exist.' }}</p>
      <button @click="refresh()">Retry</button>
      <NuxtLink to="/posts">← Back to posts</NuxtLink>
    </div>

    <article v-else-if="post">
      <h1>{{ post.title }}</h1>
      <p>{{ post.body }}</p>
      <NuxtLink to="/posts">← Back to posts</NuxtLink>
    </article>

    <p v-else>Loading...</p>
  </div>
</template>

<style scoped>
.error-inline {
  padding: 1.5rem;
  background: #fffbeb;
  border: 1px solid #d69e2e;
  border-radius: 0.375rem;
}

.error-inline h2 {
  color: #d69e2e;
  margin-top: 0;
}

.error-inline button {
  padding: 0.5rem 1rem;
  background: #d69e2e;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  margin-right: 1rem;
}

.error-inline button:hover {
  background: #b7791f;
}

article {
  line-height: 1.6;
}
</style>
