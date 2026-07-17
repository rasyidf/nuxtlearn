<template>
  <div>
    <header>
      <nav>
        <ul style="display: flex; gap: 1rem; list-style: none; padding: 1rem;">
          <li><NuxtLink to="/">Home</NuxtLink></li>
          <li><NuxtLink to="/about">About</NuxtLink></li>
          <li><NuxtLink to="/blog">Blog</NuxtLink></li>
        </ul>
      </nav>
    </header>
    <main style="padding: 1rem;">
      <slot />
    </main>
  </div>
</template>
