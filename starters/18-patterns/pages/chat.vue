<script setup lang="ts">
const { messages, connected, send } = useChat()
const input = ref('')

function handleSend() {
  const text = input.value.trim()
  if (!text) return
  send(text)
  messages.value.push({ type: 'self', text })
  input.value = ''
}
</script>

<template>
  <div>
    <h1>WebSocket Chat</h1>
    <p>
      Status:
      <span :style="{ color: connected ? '#10b981' : '#ef4444' }">
        {{ connected ? '● Connected' : '○ Disconnected' }}
      </span>
    </p>

    <div
      style="border: 1px solid #ddd; border-radius: 8px; padding: 1rem; height: 300px; overflow-y: auto; margin: 1rem 0;"
    >
      <div v-for="(msg, i) in messages" :key="i" style="margin-bottom: 0.5rem;">
        <template v-if="msg.type === 'system'">
          <em style="color: #6b7280;">{{ msg.message }}</em>
        </template>
        <template v-else-if="msg.type === 'self'">
          <strong style="color: #3b82f6;">You:</strong> {{ msg.text }}
        </template>
        <template v-else>
          <strong style="color: #8b5cf6;">{{ msg.from }}:</strong> {{ msg.text }}
        </template>
      </div>
      <p v-if="messages.length === 0" style="color: #9ca3af;">No messages yet. Open another tab to chat!</p>
    </div>

    <form style="display: flex; gap: 0.5rem;" @submit.prevent="handleSend">
      <input
        v-model="input"
        type="text"
        placeholder="Type a message..."
        :disabled="!connected"
        style="flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
      />
      <button
        type="submit"
        :disabled="!connected || !input.trim()"
        style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Send
      </button>
    </form>
  </div>
</template>
