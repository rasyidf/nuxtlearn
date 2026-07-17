<template>
  <div>
    <NuxtLink to="/blog" class="text-blue-600 hover:underline text-sm">← Back to Blog</NuxtLink>

    <h1 class="text-3xl font-bold mt-4 mb-4">Blog Post #{{ route.params.id }} — ISR</h1>

    <div class="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
      <p class="text-amber-800 font-medium">⏱️ This page uses ISR with a 60-second TTL.</p>
      <p class="text-amber-600 text-sm mt-1">
        The server timestamp below proves caching. It only changes after 60 seconds.
      </p>
    </div>

    <div class="border rounded p-4">
      <p class="text-gray-700">
        This is the content for post <strong>#{{ route.params.id }}</strong>.
      </p>
      <p class="text-gray-500 text-sm mt-4">
        Server time when rendered: <code>{{ data?.time }}</code>
      </p>
    </div>

    <div class="mt-6 bg-gray-100 p-4 rounded text-sm">
      <p class="font-medium">How to verify ISR:</p>
      <ol class="list-decimal pl-5 mt-2 space-y-1 text-gray-600">
        <li>Note the server timestamp above</li>
        <li>Refresh immediately — timestamp stays the same (cached)</li>
        <li>Wait 60+ seconds, refresh — timestamp updates (regenerated)</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data } = await useFetch('/api/time')
</script>
