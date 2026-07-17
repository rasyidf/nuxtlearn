<script setup lang="ts">
const { features } = useRuntimeConfig().public
</script>

<template>
  <div>
    <header style="padding: 1rem; border-bottom: 1px solid #ddd; margin-bottom: 1rem;">
      <nav style="display: flex; gap: 1rem; align-items: center;">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/chat">Chat</NuxtLink>
        <NuxtLink to="/beta">
          Beta
          <span
            v-if="features.betaPage"
            style="background: #10b981; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-left: 4px;"
          >
            ENABLED
          </span>
        </NuxtLink>
        <NuxtLink to="/rate-limit-test" style="margin-left: auto;">Rate Limit Test</NuxtLink>
      </nav>
    </header>
    <main style="padding: 1rem;">
      <slot />
    </main>
  </div>
</template>
