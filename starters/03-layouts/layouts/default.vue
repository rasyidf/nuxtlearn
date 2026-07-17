<template>
  <div>
    <header>
      <nav>
        <NuxtLink to="/">Home</NuxtLink> |
        <NuxtLink to="/dashboard">Dashboard</NuxtLink>
      </nav>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>
