<script setup lang="ts">
</script>

<template>
  <div>
    <h1>About</h1>
    <UiCard>
      <template #header>Component Auto-Imports</template>
      <p>
        This page demonstrates that components are auto-imported globally.
        <code>&lt;UiCard&gt;</code> works here without any explicit import — just like on the home page.
      </p>
      <p>
        Nuxt scans the <code>components/</code> directory and registers all components automatically.
        The path becomes the prefix: <code>components/ui/Card.vue</code> → <code>&lt;UiCard&gt;</code>.
      </p>
      <template #footer>
        <NuxtLink to="/">← Back to Home</NuxtLink>
      </template>
    </UiCard>
  </div>
</template>

<style scoped>
h1 {
  margin-bottom: 1.5rem;
}
</style>
