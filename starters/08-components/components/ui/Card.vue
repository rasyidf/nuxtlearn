<script setup lang="ts">
</script>

<template>
  <div class="card">
    <div v-if="$slots.header" class="card__header">
      <slot name="header" />
    </div>
    <div class="card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #27272a;
  border-radius: 8px;
  overflow: hidden;
  background: #18181b;
}

.card__header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #27272a;
  font-weight: 600;
}

.card__body {
  padding: 1.25rem;
}

.card__footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #27272a;
  font-size: 0.85rem;
  color: #a1a1aa;
}
</style>
