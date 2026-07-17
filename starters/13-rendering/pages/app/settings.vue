<template>
  <div>
    <NuxtLink to="/app" class="text-blue-600 hover:underline text-sm">← Back to Dashboard</NuxtLink>

    <h1 class="text-3xl font-bold mt-4 mb-4">Settings — SPA Mode</h1>

    <div class="bg-purple-50 border border-purple-200 rounded p-4 mb-6">
      <p class="text-purple-800 font-medium">🖥️ Another client-only page in the SPA zone.</p>
      <p class="text-purple-600 text-sm mt-1">
        Navigation between /app/* pages is fully client-side.
        No server roundtrip — just Vue Router doing its thing.
      </p>
    </div>

    <div class="border rounded p-4">
      <h2 class="text-lg font-semibold mb-3">App Settings</h2>

      <div class="space-y-3">
        <label class="flex items-center gap-3">
          <input v-model="settings.darkMode" type="checkbox" class="w-4 h-4" />
          <span>Dark Mode</span>
        </label>
        <label class="flex items-center gap-3">
          <input v-model="settings.notifications" type="checkbox" class="w-4 h-4" />
          <span>Enable Notifications</span>
        </label>
        <label class="flex items-center gap-3">
          <input v-model="settings.analytics" type="checkbox" class="w-4 h-4" />
          <span>Share Analytics</span>
        </label>
      </div>

      <p class="text-gray-500 text-sm mt-4">
        These settings are client-side only (state resets on refresh).
        In a real app, you'd persist these via API.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const settings = reactive({
  darkMode: false,
  notifications: true,
  analytics: false,
})
</script>
