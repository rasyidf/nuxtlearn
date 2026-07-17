<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b border-gray-200 bg-white px-6 py-4">
      <div class="mx-auto flex max-w-4xl items-center justify-between">
        <h1 class="text-xl font-bold" :style="{ color: appConfig.ui.primaryColor }">
          {{ appConfig.site.name }}
        </h1>
        <nav class="flex gap-4">
          <NuxtLink to="/" class="hover:text-blue-500">Home</NuxtLink>
          <NuxtLink to="/about" class="hover:text-blue-500">About</NuxtLink>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-4xl px-6 py-8">
      <slot />
    </main>
  </div>
</template>
