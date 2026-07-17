interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export function useNotifications() {
  const notifications = useState<Notification[]>('notifications', () => [])

  function show(type: Notification['type'], message: string, timeout = 3000) {
    const id = Math.random().toString(36).slice(2)
    notifications.value.push({ id, type, message })
    if (timeout > 0) setTimeout(() => dismiss(id), timeout)
    return id
  }

  function dismiss(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  const success = (msg: string) => show('success', msg)
  const error = (msg: string) => show('error', msg, 0)
  const info = (msg: string) => show('info', msg)

  return { notifications, show, dismiss, success, error, info }
}
