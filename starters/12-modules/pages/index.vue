<template>
  <div>
    <h1>Chapter 12: Modules &amp; Plugins</h1>

    <section style="margin-top: 1.5rem;">
      <h2>Toast Plugin Demo</h2>
      <p>Click the buttons to trigger toasts via <code>$toast.show()</code>:</p>
      <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
        <button @click="showInfo">Info Toast</button>
        <button @click="showSuccess">Success Toast</button>
        <button @click="showError">Error Toast</button>
      </div>
    </section>

    <section style="margin-top: 1.5rem;">
      <h2>Analytics Plugin</h2>
      <p>
        Open DevTools console — the <code>analytics.client.ts</code> plugin logs
        every page navigation via the <code>page:finish</code> hook.
      </p>
      <p>Navigate to <NuxtLink to="/about">About</NuxtLink> and check the console.</p>
    </section>

    <section style="margin-top: 1.5rem;">
      <h2>Build Info Module</h2>
      <p>
        The local <code>modules/build-info.ts</code> module hooks into <code>ready</code>
        and logs loaded module count to the server terminal at startup.
      </p>
    </section>

    <section style="margin-top: 1.5rem;">
      <h2>Error Handler Plugin</h2>
      <p>
        The <code>error-handler.ts</code> plugin catches Vue errors via the
        <code>vue:error</code> hook. Click below to trigger one:
      </p>
      <button @click="triggerError">Trigger Error</button>
    </section>
  </div>
</template>

<script setup lang="ts">
const { $toast } = useNuxtApp()

function showInfo() {
  $toast.show('This is an info toast')
}

function showSuccess() {
  $toast.show('Operation successful!', 'success')
}

function showError() {
  $toast.show('Something went wrong', 'error')
}

function triggerError() {
  throw new Error('Intentional error to demonstrate vue:error hook')
}
</script>
