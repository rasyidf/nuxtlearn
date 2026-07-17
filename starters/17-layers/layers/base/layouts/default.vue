<template>
  <div class="layout">
    <header class="layout-header">
      <h1>Base Layer</h1>
      <nav>
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
      </nav>
    </header>
    <main class="layout-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout { max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
.layout-header { margin-bottom: 2rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; }
.layout-header h1 { margin: 0 0 0.5rem; font-size: 1.5rem; color: #374151; }
.layout-header nav { display: flex; gap: 1rem; }
.layout-header nav a { color: #3b82f6; text-decoration: none; }
.layout-header nav a:hover { text-decoration: underline; }
.layout-main { min-height: 60vh; }
</style>
