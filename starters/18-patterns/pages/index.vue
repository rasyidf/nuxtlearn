<script setup lang="ts">
const { features } = useRuntimeConfig().public
</script>

<template>
  <div>
    <h1>Chapter 18: Real-World Patterns</h1>
    <p>This starter demonstrates common production patterns in Nuxt.</p>

    <section style="margin-top: 2rem;">
      <h2>Feature Flags</h2>
      <p>Controlled via <code>runtimeConfig.public.features</code>:</p>
      <ul>
        <li>
          <strong>betaPage:</strong>
          <code>{{ features.betaPage }}</code>
          — {{ features.betaPage ? 'Beta page is accessible' : 'Beta page is gated (404)' }}
        </li>
        <li>
          <strong>darkMode:</strong>
          <code>{{ features.darkMode }}</code>
        </li>
      </ul>
      <p>
        Toggle with env var: <code>NUXT_PUBLIC_FEATURES_BETA_PAGE=true nuxt dev</code>
      </p>
    </section>

    <section style="margin-top: 2rem;">
      <h2>WebSocket Chat</h2>
      <p>
        Real-time messaging via Nitro's WebSocket support.
        <NuxtLink to="/chat">Open Chat →</NuxtLink>
      </p>
    </section>

    <section style="margin-top: 2rem;">
      <h2>Rate Limiting</h2>
      <p>
        All <code>/api/*</code> routes are rate-limited to 30 requests per minute per IP.
        Headers <code>X-RateLimit-Limit</code> and <code>X-RateLimit-Remaining</code> are set on every response.
      </p>
      <p>
        <NuxtLink to="/rate-limit-test">Test Rate Limiting →</NuxtLink>
      </p>
    </section>
  </div>
</template>
