<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <div>
    <h1>Chapter 16: Deployment</h1>

    <section style="margin-top: 2rem;">
      <h2>Runtime Config (Public)</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <thead>
          <tr>
            <th style="border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left;">Key</th>
            <th style="border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 0.5rem;"><code>appVersion</code></td>
            <td style="border: 1px solid #e2e8f0; padding: 0.5rem;">{{ config.public.appVersion }}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 0.5rem;"><code>apiBase</code></td>
            <td style="border: 1px solid #e2e8f0; padding: 0.5rem;">{{ config.public.apiBase }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section style="margin-top: 2rem;">
      <h2>API Endpoints</h2>
      <ul>
        <li><a href="/api/health">/api/health</a> — Health check (used by Docker HEALTHCHECK)</li>
        <li><a href="/api/config-check">/api/config-check</a> — Shows config visibility (server-side)</li>
      </ul>
    </section>

    <section style="margin-top: 2rem;">
      <h2>Environment Variable Override Pattern</h2>
      <p>Nuxt allows runtime config to be overridden via environment variables using the <code>NUXT_</code> prefix convention:</p>
      <ul>
        <li><code>NUXT_API_SECRET</code> → <code>runtimeConfig.apiSecret</code></li>
        <li><code>NUXT_PUBLIC_APP_VERSION</code> → <code>runtimeConfig.public.appVersion</code></li>
        <li><code>NUXT_PUBLIC_API_BASE</code> → <code>runtimeConfig.public.apiBase</code></li>
      </ul>
      <p style="margin-top: 1rem; padding: 1rem; background: #f7fafc; border-left: 4px solid #4299e1;">
        <strong>Key insight:</strong> These overrides happen at <em>runtime</em>, not build time.
        The <code>.output/</code> bundle reads env vars when the server starts, so one build artifact
        can serve multiple environments (staging, production) just by changing env vars.
      </p>
    </section>

    <section style="margin-top: 2rem;">
      <NuxtLink to="/env-demo">→ See Env Demo page for more details</NuxtLink>
    </section>
  </div>
</template>
