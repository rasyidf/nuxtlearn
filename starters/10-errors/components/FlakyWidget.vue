<script setup lang="ts">
if (Math.random() < 0.5) {
  throw createError({
    statusCode: 500,
    statusMessage: 'FlakyWidget crashed! It happens 50% of the time.',
  })
}
</script>

<template>
  <div class="flaky-widget">
    <p>✅ FlakyWidget loaded successfully! (You got lucky)</p>
  </div>
</template>

<style scoped>
.flaky-widget {
  padding: 1rem;
  background: #c6f6d5;
  border: 1px solid #38a169;
  border-radius: 0.375rem;
  margin: 1rem 0;
}
</style>
