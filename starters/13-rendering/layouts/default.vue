<template>
  <div class="min-h-screen">
    <header class="bg-gray-900 text-white px-6 py-4">
      <nav class="max-w-4xl mx-auto flex items-center gap-6">
        <span class="font-bold text-lg">Nuxt Rendering Modes</span>
        <NuxtLink to="/" class="hover:text-blue-300 transition-colors">
          Home <span class="text-xs text-gray-400">(prerender)</span>
        </NuxtLink>
        <NuxtLink to="/about" class="hover:text-blue-300 transition-colors">
          About <span class="text-xs text-gray-400">(prerender)</span>
        </NuxtLink>
        <NuxtLink to="/blog" class="hover:text-blue-300 transition-colors">
          Blog <span class="text-xs text-gray-400">(ISR 60s)</span>
        </NuxtLink>
        <NuxtLink to="/app" class="hover:text-blue-300 transition-colors">
          App <span class="text-xs text-gray-400">(SPA)</span>
        </NuxtLink>
      </nav>
    </header>
    <main class="max-w-4xl mx-auto px-6 py-8">
      <slot />
    </main>
  </div>
</template>
