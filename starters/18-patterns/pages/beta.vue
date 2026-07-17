<script setup lang="ts">
definePageMeta({
  middleware: ['feature-gate'],
})
</script>

<template>
  <div>
    <h1>🚀 Welcome to the Beta!</h1>
    <p>This page is only accessible when the <code>betaPage</code> feature flag is enabled.</p>
    <p>
      You're seeing this because <code>NUXT_PUBLIC_FEATURES_BETA_PAGE</code> is set to <code>true</code>,
      or the <code>runtimeConfig.public.features.betaPage</code> default was changed.
    </p>

    <div style="margin-top: 2rem; padding: 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
      <h2>Beta Features</h2>
      <ul>
        <li>✅ New dashboard layout</li>
        <li>✅ Advanced analytics</li>
        <li>🔜 AI-powered recommendations</li>
      </ul>
    </div>
  </div>
</template>
