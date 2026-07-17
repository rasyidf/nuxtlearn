<template>
  <footer class="footer">
    <p>© {{ new Date().getFullYear() }} NuxtLearn — Server-rendered component (.server.vue)</p>
    <p class="hint">This HTML is generated on the server and never hydrated on the client.</p>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 3rem;
  padding: 1.5rem;
  border-top: 1px solid #27272a;
  text-align: center;
  color: #71717a;
  font-size: 0.85rem;
}

.hint {
  font-size: 0.75rem;
  color: #52525b;
}
</style>
