<script setup lang="ts">
const { notifications, dismiss } = useNotifications()

const typeStyles: Record<string, string> = {
  success: 'bg-green-100 border-green-500 text-green-800',
  error: 'bg-red-100 border-red-500 text-red-800',
  info: 'bg-blue-100 border-blue-500 text-blue-800',
}
</script>

<template>
  <div class="fixed right-4 top-4 z-50 flex flex-col gap-2">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="flex items-center gap-2 rounded border-l-4 px-4 py-3 shadow-md"
      :class="typeStyles[notification.type]"
    >
      <span class="flex-1 text-sm">{{ notification.message }}</span>
      <button
        class="ml-2 text-lg leading-none opacity-60 hover:opacity-100"
        @click="dismiss(notification.id)"
      >
        &times;
      </button>
    </div>
  </div>
</template>
