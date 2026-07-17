export function useAuth() {
  const token = useCookie('auth-token')
  const user = useState<{ name: string; role: string } | null>('auth-user', () => null)
  const isAuthenticated = computed(() => !!token.value)

  async function login(name: string) {
    token.value = 'fake-token-' + Date.now()
    user.value = { name, role: name === 'admin' ? 'admin' : 'user' }
  }

  function logout() {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  return { token, user, isAuthenticated, login, logout }
}
