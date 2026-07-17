export function useChat() {
  const messages = ref<{ type: string; message?: string; from?: string; text?: string }[]>([])
  const connected = ref(false)
  let ws: WebSocket | null = null

  function connect() {
    if (import.meta.server) return
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    ws = new WebSocket(`${proto}//${location.host}/_ws`)
    ws.onopen = () => { connected.value = true }
    ws.onmessage = (e) => { messages.value.push(JSON.parse(e.data)) }
    ws.onclose = () => { connected.value = false; setTimeout(connect, 3000) }
  }

  function send(text: string) { ws?.send(text) }
  function disconnect() { ws?.close() }

  onMounted(connect)
  onUnmounted(disconnect)

  return { messages, connected, send }
}
