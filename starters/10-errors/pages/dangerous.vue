<script setup lang="ts">
const triggerError = () => {
  showError({
    statusCode: 500,
    statusMessage: 'Manually triggered error',
  })
}
</script>

<template>
  <div>
    <h1>Dangerous Page</h1>
    <p>Click the button below to trigger a fatal error using <code>showError()</code>.</p>
    <p>This will replace the entire page with <code>error.vue</code>.</p>

    <button class="danger-btn" @click="triggerError">
      💣 Trigger Fatal Error
    </button>
  </div>
</template>

<style scoped>
.danger-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
}

.danger-btn:hover {
  background: #c53030;
}

code {
  background: #edf2f7;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
