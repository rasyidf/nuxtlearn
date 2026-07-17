interface Item {
  id: number
  name: string
  createdAt: string
}

const items: Item[] = [
  { id: 1, name: 'Learn Nuxt', createdAt: '2025-01-01T00:00:00Z' },
  { id: 2, name: 'Build APIs', createdAt: '2025-01-02T00:00:00Z' },
  { id: 3, name: 'Deploy', createdAt: '2025-01-03T00:00:00Z' },
]

let nextId = 4

export function getItems() {
  return items
}

export function getItem(id: number) {
  return items.find(item => item.id === id)
}

export function addItem(name: string) {
  const item: Item = { id: nextId++, name, createdAt: new Date().toISOString() }
  items.push(item)
  return item
}

export function deleteItem(id: number) {
  const index = items.findIndex(item => item.id === id)
  if (index === -1) return false
  items.splice(index, 1)
  return true
}
