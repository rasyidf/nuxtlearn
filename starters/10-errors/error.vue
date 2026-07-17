<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => props.error.statusCode)

const title = computed(() => {
  switch (statusCode.value) {
    case 404:
      return 'Page Not Found'
    case 403:
      return 'Forbidden'
    case 500:
      return 'Internal Server Error'
    default:
      return 'An Error Occurred'
  }
})

const description = computed(() => {
  switch (statusCode.value) {
    case 404:
      return 'The page you are looking for does not exist or has been moved.'
    case 403:
      return 'You do not have permission to access this resource.'
    case 500:
      return 'Something went wrong on our end. Please try again later.'
    default:
      return props.error.statusMessage || 'An unexpected error occurred.'
  }
})

const handleClearError = () => {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="error-page">
    <h1>{{ statusCode }}</h1>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <button @click="handleClearError">Go Home</button>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-family: sans-serif;
  text-align: center;
  padding: 2rem;
}

.error-page h1 {
  font-size: 6rem;
  margin: 0;
  color: #e53e3e;
}

.error-page h2 {
  font-size: 1.5rem;
  margin: 0.5rem 0;
  color: #2d3748;
}

.error-page p {
  color: #718096;
  margin: 1rem 0 2rem;
  max-width: 400px;
}

.error-page button {
  padding: 0.75rem 1.5rem;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
}

.error-page button:hover {
  background: #2c5282;
}
</style>
