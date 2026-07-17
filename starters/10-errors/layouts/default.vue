<template>
  <div>
    <header class="site-header">
      <nav>
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/posts">Posts</NuxtLink>
        <NuxtLink to="/dangerous">Dangerous</NuxtLink>
      </nav>
    </header>
    <main class="site-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.site-header {
  padding: 1rem 2rem;
  background: #2d3748;
}

.site-header nav {
  display: flex;
  gap: 1.5rem;
}

.site-header a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.site-header a:hover {
  text-decoration: underline;
}

.site-main {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
</style>
