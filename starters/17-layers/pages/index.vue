<template>
  <div>
    <h2>Chapter 17: Layers & Monorepo</h2>

    <BaseCard>
      <h3>Composable from Base Layer</h3>
      <p>{{ greeting }}</p>
    </BaseCard>

    <BaseCard>
      <h3>Component Override Demo</h3>
      <p>
        This <code>&lt;BaseButton&gt;</code> is <strong>blue</strong> because
        the app-level <code>components/BaseButton.vue</code> overrides the
        layer's gray version.
      </p>
      <BaseButton @click="count++">Clicked {{ count }} times</BaseButton>
    </BaseCard>

    <BaseCard>
      <h3>BaseCard from Layer</h3>
      <p>
        This card component comes directly from <code>layers/base/</code> —
        no override exists at the app level.
      </p>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
const { greeting } = useGreeting('Nuxt Developer')
const count = ref(0)
</script>
