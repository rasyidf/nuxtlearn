<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const viewportWidth = ref(0)

function updateWidth() {
  viewportWidth.value = window.innerWidth
}

onMounted(() => {
  updateWidth()
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})
</script>

<template>
  <div class="stats-widget">
    <h3>📊 Client-Only Stats</h3>
    <p>Viewport width: <strong>{{ viewportWidth }}px</strong></p>
    <p class="hint">This component only renders on the client (.client.vue suffix)</p>
  </div>
</template>

<style scoped>
.stats-widget {
  padding: 1rem;
  background: #1e3a5f;
  border-radius: 8px;
  border: 1px solid #2563eb;
}

.stats-widget h3 {
  margin: 0 0 0.5rem;
}

.hint {
  font-size: 0.8rem;
  color: #93c5fd;
  margin-top: 0.5rem;
}
</style>
