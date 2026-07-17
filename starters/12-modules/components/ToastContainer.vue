<template>
  <ClientOnly>
    <Teleport to="body">
      <div
        v-if="toasts.length"
        style="position: fixed; top: 1rem; right: 1rem; z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem;"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :style="{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            color: '#fff',
            background: toast.type === 'error' ? '#dc2626' : toast.type === 'success' ? '#16a34a' : '#2563eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            minWidth: '200px',
          }"
        >
          {{ toast.message }}
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
const { $toast } = useNuxtApp()
const toasts = $toast.toasts
</script>
