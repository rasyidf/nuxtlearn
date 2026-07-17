<template>
  <div>
    <header style="padding: 1rem; background: #1a1a2e; border-bottom: 1px solid #333;">
      <nav style="display: flex; gap: 1.5rem; max-width: 1200px; margin: 0 auto;">
        <NuxtLink to="/" style="color: #e0e0e0; text-decoration: none; font-weight: bold;">
          Home
        </NuxtLink>
        <NuxtLink to="/products/1" style="color: #e0e0e0; text-decoration: none;">
          Products
        </NuxtLink>
        <NuxtLink to="/dashboard" style="color: #e0e0e0; text-decoration: none;">
          Dashboard
        </NuxtLink>
      </nav>
    </header>

    <main style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
      <slot />
    </main>
  </div>
</template>
