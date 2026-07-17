<template>
  <button class="app-btn" v-bind="$attrs"><slot /></button>
</template>

<style scoped>
.app-btn { padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; }
.app-btn:hover { background: #2563eb; }
</style>
