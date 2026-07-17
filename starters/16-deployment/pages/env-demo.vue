<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <div>
    <h1>Environment Variable Convention</h1>

    <section style="margin-top: 2rem;">
      <h2>The <code>NUXT_</code> Convention</h2>
      <p>Nuxt automatically maps environment variables to runtime config using this pattern:</p>

      <table style="border-collapse: collapse; width: 100%; max-width: 700px; margin-top: 1rem;">
        <thead>
          <tr>
            <th style="border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left;">Env Variable</th>
            <th style="border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left;">Maps To</th>
            <th style="border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left;">Scope</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 0.5rem;"><code>NUXT_API_SECRET</code></td>
            <td style="border: 1px solid #e2e8f0; padding: 0.5rem;"><code>runtimeConfig.apiSecret</code></td>
            <td style="border: 1px solid #e2e8f0; padding: 0.5rem;">Server only</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 0.5rem;"><code>NUXT_PUBLIC_APP_VERSION</code></td>
            <td style="border: 1px solid #e2e8f0; padding: 0.5rem;"><code>runtimeConfig.public.appVersion</code></td>
            <td style="border: 1px solid #e2e8f0; padding: 0.5rem;">Client + Server</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 0.5rem;"><code>NUXT_PUBLIC_API_BASE</code></td>
            <td style="border: 1px solid #e2e8f0; padding: 0.5rem;"><code>runtimeConfig.public.apiBase</code></td>
            <td style="border: 1px solid #e2e8f0; padding: 0.5rem;">Client + Server</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section style="margin-top: 2rem;">
      <h2>Current Values</h2>
      <p>These are the values currently resolved by the runtime:</p>
      <pre style="background: #1a202c; color: #e2e8f0; padding: 1rem; border-radius: 4px; overflow-x: auto;">{{ JSON.stringify(config.public, null, 2) }}</pre>
    </section>

    <section style="margin-top: 2rem;">
      <h2>Naming Rules</h2>
      <ul>
        <li><code>NUXT_</code> prefix is required</li>
        <li><code>PUBLIC_</code> after NUXT_ exposes the value to the client</li>
        <li>Nested keys use <code>_</code> as separator (camelCase → UPPER_SNAKE_CASE)</li>
        <li>Example: <code>runtimeConfig.public.apiBase</code> → <code>NUXT_PUBLIC_API_BASE</code></li>
      </ul>
    </section>

    <section style="margin-top: 2rem;">
      <h2>Build-time vs Runtime</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; max-width: 700px;">
        <div style="padding: 1rem; background: #fff5f5; border-radius: 4px;">
          <h3 style="margin: 0 0 0.5rem;">Build-time</h3>
          <ul style="margin: 0; padding-left: 1.5rem;">
            <li>Baked into the bundle</li>
            <li>Cannot change without rebuild</li>
            <li>e.g., <code>nuxt.config.ts</code> options</li>
          </ul>
        </div>
        <div style="padding: 1rem; background: #f0fff4; border-radius: 4px;">
          <h3 style="margin: 0 0 0.5rem;">Runtime</h3>
          <ul style="margin: 0; padding-left: 1.5rem;">
            <li>Read when server starts</li>
            <li>One build, many environments</li>
            <li>e.g., <code>NUXT_*</code> env vars</li>
          </ul>
        </div>
      </div>
    </section>

    <section style="margin-top: 2rem;">
      <h2>Try It</h2>
      <p>Run the production server with overridden values:</p>
      <pre style="background: #1a202c; color: #e2e8f0; padding: 1rem; border-radius: 4px; overflow-x: auto;">NUXT_PUBLIC_APP_VERSION=2.0.0 NUXT_API_SECRET=my-secret node .output/server/index.mjs</pre>
    </section>
  </div>
</template>
