export default defineNuxtPlugin(() => {
  const toasts = ref<{ id: string; message: string; type: string }[]>([])

  function show(message: string, type = 'info') {
    const id = Math.random().toString(36).slice(2)
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), 3000)
    return id
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { provide: { toast: { show, dismiss, toasts } } }
})
