<template>
  <div>
    <h1 class="text-3xl font-bold mb-4">Home — Prerendered</h1>

    <div class="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
      <p class="text-blue-800 font-medium">🏗️ This page was generated at build time.</p>
      <p class="text-blue-600 text-sm mt-1">
        The HTML is static — it won't change until the next build.
        View source to confirm: you'll see fully rendered HTML.
      </p>
    </div>

    <h2 class="text-xl font-semibold mb-3">Rendering Modes in This App</h2>
    <ul class="space-y-2 text-gray-700">
      <li><strong>/</strong> and <strong>/about</strong> — <code>prerender: true</code> → built at generate time</li>
      <li><strong>/blog/**</strong> — <code>isr: 60</code> → cached 60s, then regenerated on next request</li>
      <li><strong>/app/**</strong> — <code>ssr: false</code> → client-only SPA rendering</li>
      <li><strong>/api/**</strong> — <code>cors: true</code> + cache headers</li>
    </ul>

    <p class="mt-6 text-gray-500 text-sm">
      Generated at: <code>{{ buildTimestamp }}</code>
    </p>
  </div>
</template>

<script setup lang="ts">
// This value is baked in at build/prerender time and never changes
const buildTimestamp = new Date().toISOString()
</script>
