export function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => {
    count.value = initial
  }
  return { count, increment, decrement, reset }
}
