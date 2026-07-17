<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <div>
    <header style="padding: 1rem; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 1rem;">
      <nav style="display: flex; gap: 1rem; align-items: center;">
        <NuxtLink to="/" style="font-weight: bold; text-decoration: none;">Home</NuxtLink>
        <NuxtLink to="/env-demo" style="text-decoration: none;">Env Demo</NuxtLink>
        <a href="/api/health" style="text-decoration: none;">Health Check</a>
        <a href="/api/config-check" style="text-decoration: none;">Config Check</a>
      </nav>
      <span style="margin-left: auto; background: #e2e8f0; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
        v{{ config.public.appVersion }}
      </span>
    </header>
    <main style="padding: 2rem;">
      <slot />
    </main>
  </div>
</template>
