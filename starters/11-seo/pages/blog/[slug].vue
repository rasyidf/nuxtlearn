<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()

const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

useSeoMeta({
  title: () => post.value?.title ?? '',
  description: () => post.value?.excerpt ?? '',
  ogTitle: () => post.value?.title ?? '',
  ogDescription: () => post.value?.excerpt ?? '',
  ogImage: () => post.value?.coverImage ?? '',
  ogType: 'article',
  articleAuthor: () => post.value?.author ?? '',
  articlePublishedTime: () => post.value?.publishedAt ?? '',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.value.title,
        description: post.value.excerpt,
        image: post.value.coverImage,
        author: {
          '@type': 'Person',
          name: post.value.author,
        },
        datePublished: post.value.publishedAt,
        publisher: {
          '@type': 'Organization',
          name: 'NuxtLearn',
          url: config.public.siteUrl,
        },
      }),
    },
  ],
})
</script>

<template>
  <article v-if="post">
    <header>
      <h1>{{ post.title }}</h1>
      <p>
        By {{ post.author }} ·
        {{ new Date(post.publishedAt).toLocaleDateString() }}
      </p>
      <img
        :src="post.coverImage"
        :alt="post.title"
        style="max-width: 100%; height: auto;"
      />
    </header>
    <section>
      <p>{{ post.content }}</p>
    </section>
    <footer style="margin-top: 2rem;">
      <NuxtLink to="/blog">← Back to Blog</NuxtLink>
    </footer>
  </article>
</template>
