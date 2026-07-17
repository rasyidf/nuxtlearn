<script setup lang="ts">
const widgetKey = ref(0)

const retryWidget = () => {
  widgetKey.value++
}
</script>

<template>
  <div>
    <h1>Chapter 10: Error Handling</h1>

    <nav class="page-links">
      <NuxtLink to="/posts">→ Posts (server error demo)</NuxtLink>
      <NuxtLink to="/dangerous">→ Dangerous (showError demo)</NuxtLink>
    </nav>

    <section class="boundary-demo">
      <h2>NuxtErrorBoundary Demo</h2>
      <p>The widget below has a 50% chance of crashing on render:</p>

      <NuxtErrorBoundary :key="widgetKey">
        <FlakyWidget />

        <template #error="{ error }">
          <div class="error-box">
            <p>💥 Component error: {{ error.message }}</p>
            <button @click="retryWidget">Retry</button>
          </div>
        </template>
      </NuxtErrorBoundary>
    </section>
  </div>
</template>

<style scoped>
.page-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.page-links a {
  color: #3182ce;
  text-decoration: none;
}

.page-links a:hover {
  text-decoration: underline;
}

.boundary-demo {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.error-box {
  padding: 1rem;
  background: #fed7d7;
  border: 1px solid #e53e3e;
  border-radius: 0.375rem;
  margin: 1rem 0;
}

.error-box button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.error-box button:hover {
  background: #c53030;
}
</style>
