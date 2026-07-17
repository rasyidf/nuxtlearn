<script setup lang="ts">
const showChart = ref(false)
</script>

<template>
  <div>
    <h1>Chapter 08: Components</h1>
    <p>Demonstrating Nuxt component patterns: auto-imports, path-based naming, .client/.server suffixes, and lazy loading.</p>

    <!-- UiButton variants -->
    <section>
      <h2>UiButton (components/ui/Button.vue)</h2>
      <p>Path-based naming: <code>components/ui/Button.vue</code> → <code>&lt;UiButton&gt;</code></p>
      <div class="button-row">
        <UiButton variant="primary">Primary</UiButton>
        <UiButton variant="secondary">Secondary</UiButton>
        <UiButton variant="danger">Danger</UiButton>
        <UiButton variant="primary" disabled>Disabled</UiButton>
      </div>
    </section>

    <!-- UiCard with slots -->
    <section>
      <h2>UiCard (components/ui/Card.vue)</h2>
      <p>Named slots: <code>#header</code>, default, <code>#footer</code></p>
      <UiCard>
        <template #header>Card Header</template>
        <p>This is the card body content. The card uses named slots for flexible composition.</p>
        <template #footer>Card footer — metadata goes here</template>
      </UiCard>
    </section>

    <!-- Client-only component -->
    <section>
      <h2>DashboardStatsWidget (.client.vue)</h2>
      <p>Only renders on the client. Uses <code>window.innerWidth</code> safely.</p>
      <ClientOnly>
        <DashboardStatsWidget />
        <template #fallback>
          <div class="fallback">⏳ Loading client-only widget...</div>
        </template>
      </ClientOnly>
    </section>

    <!-- Lazy-loaded component -->
    <section>
      <h2>LazyHeavyChart (lazy loading)</h2>
      <p>Uses the <code>Lazy</code> prefix for automatic code-splitting. Only loaded when <code>showChart</code> is true.</p>
      <UiButton variant="secondary" @click="showChart = !showChart">
        {{ showChart ? 'Hide' : 'Show' }} Chart
      </UiButton>
      <LazyHeavyChart v-if="showChart" />
    </section>

    <!-- Server-only component -->
    <section>
      <h2>StaticFooter (.server.vue)</h2>
      <StaticFooter />
    </section>
  </div>
</template>

<style scoped>
section {
  margin-top: 2.5rem;
}

h2 {
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.button-row {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.fallback {
  padding: 1rem;
  background: #27272a;
  border-radius: 8px;
  color: #a1a1aa;
}
</style>
