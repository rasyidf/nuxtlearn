<template>
  <div>
    <h1 class="text-3xl font-bold mb-4">Blog — ISR (60s)</h1>

    <div class="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
      <p class="text-amber-800 font-medium">⏱️ This page is cached for 60 seconds, then regenerated.</p>
      <p class="text-amber-600 text-sm mt-1">
        Incremental Static Regeneration (ISR) serves a cached version instantly,
        then regenerates in the background after the TTL expires.
        Refresh after 60s to see a new timestamp.
      </p>
    </div>

    <p class="text-gray-500 text-sm mb-4">
      Server rendered at: <code>{{ data?.renderedAt }}</code>
    </p>

    <div class="space-y-4">
      <article
        v-for="post in data?.posts"
        :key="post.id"
        class="border rounded p-4 hover:border-blue-300 transition-colors"
      >
        <NuxtLink :to="`/blog/${post.id}`" class="block">
          <h2 class="text-lg font-semibold text-blue-700">{{ post.title }}</h2>
          <p class="text-gray-600 mt-1">{{ post.excerpt }}</p>
          <p class="text-gray-400 text-sm mt-2">{{ post.date }}</p>
        </NuxtLink>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useFetch('/api/posts')
</script>
