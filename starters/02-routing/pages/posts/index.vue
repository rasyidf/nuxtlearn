<template>
  <div>
    <h1>Posts</h1>
    <ul>
      <li v-for="id in [1, 2, 3]" :key="id">
        <NuxtLink :to="`/posts/${id}`">Post {{ id }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>
