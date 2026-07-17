<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
})

const { user } = useAuth()
</script>

<template>
  <div>
    <h1>Admin Panel</h1>
    <p>Hello, <strong>{{ user?.name }}</strong>. You have admin privileges.</p>
    <div style="margin-top: 1rem; padding: 1rem; background: #f0f9ff; border-radius: 8px;">
      <h2>Admin Actions</h2>
      <ul>
        <li>Manage users</li>
        <li>View system logs</li>
        <li>Configure settings</li>
      </ul>
    </div>
  </div>
</template>
