interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

export function useCart() {
  const items = useState<CartItem[]>('cart-items', () => [])
  const total = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const count = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

  function addItem(product: { id: number; name: string; price: number }) {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }

  function removeItem(id: number) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function clear() {
    items.value = []
  }

  return { items, total, count, addItem, removeItem, clear }
}
