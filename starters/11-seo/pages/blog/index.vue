<script setup lang="ts">
useSeoMeta({
  title: 'Blog',
  description: 'Read articles about Nuxt, Vue, and modern web development.',
  ogTitle: 'Blog — NuxtLearn',
  ogDescription: 'Read articles about Nuxt, Vue, and modern web development.',
})

const { data: posts } = await useFetch('/api/posts')
</script>

<template>
  <div>
    <h1>Blog</h1>
    <ul style="list-style: none; padding: 0;">
      <li v-for="post in posts" :key="post.id" style="margin-bottom: 1.5rem;">
        <NuxtLink :to="`/blog/${post.slug}`">
          <h2>{{ post.title }}</h2>
        </NuxtLink>
        <p>{{ post.excerpt }}</p>
        <small>By {{ post.author }} · {{ new Date(post.publishedAt).toLocaleDateString() }}</small>
      </li>
    </ul>
  </div>
</template>
