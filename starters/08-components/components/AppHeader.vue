<template>
  <header class="header">
    <nav class="nav">
      <NuxtLink to="/" class="logo">NuxtLearn 08</NuxtLink>
      <ul class="nav-links">
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/about">About</NuxtLink></li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.header {
  background: #18181b;
  padding: 1rem 2rem;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 960px;
  margin: 0 auto;
}

.logo {
  color: #00dc82;
  font-weight: 700;
  font-size: 1.2rem;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: #e4e4e7;
  text-decoration: none;
}

.nav-links a:hover {
  color: #00dc82;
}
</style>
