<script setup lang="ts">
const { count, increment, decrement, reset } = useCounter(0)
</script>

<template>
  <div>
    <h1>Chapter 14 — Testing</h1>

    <section>
      <h2>Counter</h2>
      <p data-testid="counter-value">Count: {{ count }}</p>
      <button data-testid="counter-increment" @click="increment">+</button>
      <button data-testid="counter-decrement" @click="decrement">-</button>
      <button data-testid="counter-reset" @click="reset">Reset</button>
    </section>

    <section>
      <h2>User Cards</h2>
      <UserCard :user-id="1" />
      <UserCard :user-id="2" />
      <UserCard :user-id="3" />
    </section>
  </div>
</template>
