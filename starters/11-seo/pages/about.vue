<script setup lang="ts">
useHead({
  title: 'About',
  link: [
    { rel: 'canonical', href: 'http://localhost:3000/about' },
  ],
})

useSeoMeta({
  description: 'Learn about the NuxtLearn project and its mission to teach Nuxt effectively.',
  ogTitle: 'About NuxtLearn',
  ogDescription: 'Learn about the NuxtLearn project and its mission to teach Nuxt effectively.',
})
</script>

<template>
  <div>
    <h1>About NuxtLearn</h1>
    <p>
      NuxtLearn is a dense, opinionated Nuxt 4 syllabus for onboarding software engineers.
      Not a docs rewrite — a guided learning path that connects the dots between official
      documentation, real patterns, and production gotchas.
    </p>
    <h2>Philosophy</h2>
    <ul>
      <li><strong>Dense</strong> — assumes you can read code, skips hand-holding</li>
      <li><strong>Guided</strong> — tells you what to read in official docs and when</li>
      <li><strong>Practical</strong> — builds a real thing, not toy examples</li>
      <li><strong>Opinionated</strong> — "here's how to do it" over "here are 5 ways"</li>
    </ul>
  </div>
</template>
