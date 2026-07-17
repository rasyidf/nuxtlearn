<template>
  <div>
    <h1 class="text-3xl font-bold mb-4">About — Prerendered</h1>

    <div class="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
      <p class="text-blue-800 font-medium">🏗️ This page is also prerendered at build time.</p>
      <p class="text-blue-600 text-sm mt-1">
        Static content that doesn't need server-side rendering on every request.
        Ideal for marketing pages, docs, and legal pages.
      </p>
    </div>

    <h2 class="text-xl font-semibold mb-3">When to Prerender</h2>
    <ul class="list-disc pl-6 space-y-1 text-gray-700">
      <li>Content rarely changes (about, terms, privacy)</li>
      <li>No user-specific data needed</li>
      <li>SEO is important (full HTML available immediately)</li>
      <li>You want the fastest possible TTFB (served from CDN/static)</li>
    </ul>

    <h2 class="text-xl font-semibold mt-6 mb-3">Config</h2>
    <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto"><code>routeRules: {
  '/about': { prerender: true }
}</code></pre>

    <p class="mt-6 text-gray-500 text-sm">
      Generated at: <code>{{ buildTimestamp }}</code>
    </p>
  </div>
</template>

<script setup lang="ts">
const buildTimestamp = new Date().toISOString()
</script>
