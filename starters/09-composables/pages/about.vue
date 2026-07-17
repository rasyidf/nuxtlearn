<script setup lang="ts">
const { notifications, success, info, dismiss } = useNotifications()
</script>

<template>
  <div class="space-y-8">
    <h2 class="text-2xl font-bold">About</h2>

    <section class="rounded-lg border p-6">
      <h3 class="mb-4 text-lg font-semibold">Shared State with useNotifications()</h3>
      <p class="mb-4 text-gray-600">
        Notifications triggered on the Home page persist here because
        <code>useNotifications()</code> uses <code>useState()</code> for shared,
        SSR-friendly state. Try adding notifications from both pages.
      </p>

      <div class="mb-4 flex gap-2">
        <button
          class="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
          @click="success('Notification from About page!')"
        >
          Add Success
        </button>
        <button
          class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          @click="info('Info from About page.')"
        >
          Add Info
        </button>
      </div>

      <div v-if="notifications.length" class="space-y-2">
        <h4 class="font-medium">Active notifications ({{ notifications.length }}):</h4>
        <ul class="list-inside list-disc text-sm text-gray-700">
          <li v-for="n in notifications" :key="n.id">
            [{{ n.type }}] {{ n.message }}
            <button class="ml-2 text-red-500 hover:underline" @click="dismiss(n.id)">
              dismiss
            </button>
          </li>
        </ul>
      </div>
      <p v-else class="text-sm text-gray-500">No active notifications.</p>
    </section>

    <NotificationToast />
  </div>
</template>
