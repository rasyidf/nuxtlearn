<template>
  <div>
    <header style="padding: 1rem; background: #f5f5f5; border-bottom: 1px solid #ddd;">
      <nav style="display: flex; gap: 1rem; align-items: center;">
        <strong>nuxtlearn-12</strong>
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
      </nav>
    </header>
    <main style="padding: 1rem;">
      <slot />
    </main>
    <ToastContainer />
  </div>
</template>
