<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()
</script>

<template>
  <div>
    <header style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid #ddd;">
      <strong>NuxtLearn</strong>
      <nav style="display: flex; gap: 0.75rem;">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/dashboard">Dashboard</NuxtLink>
        <NuxtLink to="/admin">Admin</NuxtLink>
      </nav>
      <span style="margin-left: auto;">
        {{ isAuthenticated ? `👤 ${user?.name}` : '👤 Guest' }}
      </span>
      <button v-if="isAuthenticated" @click="logout">Logout</button>
      <NuxtLink v-else to="/login">Login</NuxtLink>
    </header>
    <main style="padding: 1rem;">
      <slot />
    </main>
  </div>
</template>
