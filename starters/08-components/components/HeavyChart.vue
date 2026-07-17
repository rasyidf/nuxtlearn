<script setup lang="ts">
// Simulates a heavy component that would benefit from lazy loading.
// In a real app, this might import a charting library like Chart.js or D3.
</script>

<template>
  <div class="chart">
    <h3>📈 Chart loaded!</h3>
    <p>This component was lazily loaded using the <code>&lt;LazyHeavyChart&gt;</code> prefix.</p>
    <div class="chart-placeholder">
      <div v-for="i in 5" :key="i" class="bar" :style="{ height: `${20 + i * 15}px` }" />
    </div>
  </div>
</template>

<style scoped>
.chart {
  padding: 1.25rem;
  background: #1a2e1a;
  border: 1px solid #22c55e;
  border-radius: 8px;
}

.chart h3 {
  margin: 0 0 0.5rem;
}

.chart-placeholder {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  height: 100px;
}

.bar {
  width: 2rem;
  background: #22c55e;
  border-radius: 4px 4px 0 0;
}
</style>
