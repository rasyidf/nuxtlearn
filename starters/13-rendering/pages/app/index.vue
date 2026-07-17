<template>
  <div>
    <h1 class="text-3xl font-bold mb-4">App Dashboard — SPA Mode</h1>

    <div class="bg-purple-50 border border-purple-200 rounded p-4 mb-6">
      <p class="text-purple-800 font-medium">🖥️ This page renders client-only (view source to see empty HTML).</p>
      <p class="text-purple-600 text-sm mt-1">
        With <code>ssr: false</code>, the server sends a shell and the client renders everything.
        Great for authenticated dashboards where SEO doesn't matter.
      </p>
    </div>

    <div class="border rounded p-4 mb-6">
      <p class="text-gray-700 mb-2">Current client time (updates every second):</p>
      <p class="text-2xl font-mono font-bold text-purple-700">{{ currentTime }}</p>
    </div>

    <NuxtLink to="/app/settings" class="text-blue-600 hover:underline">
      Go to Settings →
    </NuxtLink>

    <div class="mt-6 bg-gray-100 p-4 rounded text-sm">
      <p class="font-medium">How to verify SPA mode:</p>
      <ol class="list-decimal pl-5 mt-2 space-y-1 text-gray-600">
        <li>Right-click → View Page Source</li>
        <li>Search for "App Dashboard" — you won't find it in the HTML</li>
        <li>The page content is rendered entirely by JavaScript on the client</li>
        <li>Notice: no loading flash because the shell loads instantly</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
const currentTime = ref(new Date().toLocaleTimeString())

let interval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  interval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString()
  }, 1000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>
