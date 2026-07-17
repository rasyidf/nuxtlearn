export function useGreeting(name: string) {
  const greeting = computed(() => `Hello, ${name}! (from base layer)`)
  return { greeting }
}
