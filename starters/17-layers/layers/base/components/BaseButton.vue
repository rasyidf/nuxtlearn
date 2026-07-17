<template>
  <button class="base-btn" v-bind="$attrs"><slot /></button>
</template>

<style scoped>
.base-btn { padding: 8px 16px; background: #e5e7eb; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer; }
.base-btn:hover { background: #d1d5db; }
</style>
