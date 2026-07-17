<template>
  <div>
    <h1>Welcome to NuxtLearn</h1>
    <p>This is a public page — no authentication required.</p>
    <nav style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
      <NuxtLink to="/login">→ Login</NuxtLink>
      <NuxtLink to="/dashboard">→ Dashboard (protected)</NuxtLink>
      <NuxtLink to="/admin">→ Admin (protected, admin only)</NuxtLink>
    </nav>
  </div>
</template>
