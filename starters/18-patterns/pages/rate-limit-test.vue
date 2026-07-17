<script setup lang="ts">
interface RequestLog {
  id: number
  status: number
  remaining: string | null
  error?: string
}

const logs = ref<RequestLog[]>([])
const loading = ref(false)
let counter = 0

async function fireRequest() {
  counter++
  const id = counter
  try {
    const response = await $fetch.raw('/api/items')
    logs.value.unshift({
      id,
      status: response.status,
      remaining: response.headers.get('x-ratelimit-remaining'),
    })
  } catch (err: any) {
    logs.value.unshift({
      id,
      status: err?.statusCode || err?.response?.status || 429,
      remaining: '0',
      error: err?.statusMessage || err?.message || 'Rate limited',
    })
  }
}

async function fireRapid() {
  loading.value = true
  const promises = Array.from({ length: 35 }, () => fireRequest())
  await Promise.allSettled(promises)
  loading.value = false
}

function clearLogs() {
  logs.value = []
}
</script>

<template>
  <div>
    <h1>Rate Limit Test</h1>
    <p>The API allows <strong>30 requests per minute</strong> per IP. Click below to test.</p>

    <div style="display: flex; gap: 0.5rem; margin: 1rem 0;">
      <button
        style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;"
        @click="fireRequest"
      >
        Single Request
      </button>
      <button
        :disabled="loading"
        style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;"
        @click="fireRapid"
      >
        {{ loading ? 'Firing...' : 'Fire 35 Rapid Requests' }}
      </button>
      <button
        style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;"
        @click="clearLogs"
      >
        Clear
      </button>
    </div>

    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 1rem; max-height: 400px; overflow-y: auto;">
      <p v-if="logs.length === 0" style="color: #9ca3af;">No requests fired yet.</p>
      <div
        v-for="log in logs"
        :key="log.id"
        style="font-family: monospace; font-size: 0.85rem; padding: 0.25rem 0; border-bottom: 1px solid #f3f4f6;"
      >
        <span :style="{ color: log.status === 200 ? '#10b981' : '#ef4444' }">
          #{{ log.id }} → {{ log.status }}
        </span>
        <span style="color: #6b7280; margin-left: 0.5rem;">
          remaining: {{ log.remaining }}
        </span>
        <span v-if="log.error" style="color: #ef4444; margin-left: 0.5rem;">
          ({{ log.error }})
        </span>
      </div>
    </div>
  </div>
</template>
