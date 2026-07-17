<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { user } = useAuth()
</script>

<template>
  <div>
    <h1>Dashboard</h1>
    <p>Welcome back, <strong>{{ user?.name }}</strong>!</p>
    <dl style="margin-top: 1rem;">
      <dt>Name</dt>
      <dd>{{ user?.name }}</dd>
      <dt>Role</dt>
      <dd>{{ user?.role }}</dd>
    </dl>
  </div>
</template>
