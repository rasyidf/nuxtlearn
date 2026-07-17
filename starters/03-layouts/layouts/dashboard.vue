<template>
  <div style="display: flex;">
    <aside style="width: 200px; border-right: 1px solid #ccc; padding: 1rem;">
      <h3>Dashboard</h3>
      <nav>
        <NuxtLink to="/dashboard">Overview</NuxtLink>
      </nav>
    </aside>
    <main style="flex: 1; padding: 1rem;">
      <slot />
    </main>
  </div>
</template>
