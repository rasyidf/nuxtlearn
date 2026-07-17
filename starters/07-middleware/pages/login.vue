<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
})

const route = useRoute()
const { login } = useAuth()

const name = ref('')

async function handleLogin() {
  if (!name.value.trim()) return
  await login(name.value.trim())
  const redirect = (route.query.redirect as string) || '/dashboard'
  await navigateTo(redirect)
}
</script>

<template>
  <div>
    <h1>Login</h1>
    <p>Enter a name to simulate login. Use <code>admin</code> for admin access.</p>
    <form @submit.prevent="handleLogin" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
      <input
        v-model="name"
        type="text"
        placeholder="Enter your name"
        style="padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;"
      />
      <button type="submit" style="padding: 0.5rem 1rem;">Login</button>
    </form>
  </div>
</template>
