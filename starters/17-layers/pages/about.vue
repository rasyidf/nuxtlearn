<template>
  <div>
    <h2>About</h2>

    <BaseCard>
      <h3>Layers Work Everywhere</h3>
      <p>
        Components, composables, and layouts from the base layer are available
        across all pages — not just the home page.
      </p>
      <p>{{ greeting }}</p>
    </BaseCard>

    <BaseCard>
      <h3>How It Works</h3>
      <ul>
        <li>The app's <code>nuxt.config.ts</code> uses <code>extends: ['./layers/base']</code></li>
        <li>The base layer provides components, composables, and layouts</li>
        <li>The app can override any file by placing one with the same name in its own directory</li>
        <li>Non-overridden files (like <code>BaseCard</code>) are used as-is from the layer</li>
      </ul>
    </BaseCard>

    <BaseButton>A Blue Button (overridden)</BaseButton>
  </div>
</template>

<script setup lang="ts">
const { greeting } = useGreeting('Layer Explorer')
</script>
