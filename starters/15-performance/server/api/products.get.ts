// Simulates a heavy API response with many fields per product.
// In production, you'd want to use pick/transform on the client
// to avoid shipping all this data in the SSR payload.

const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports']

function generateProducts() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    description: `This is a detailed description for Product ${i + 1}. It contains multiple sentences to simulate a real product listing with verbose content that adds weight to the API response payload.`,
    price: Math.round((Math.random() * 500 + 10) * 100) / 100,
    category: categories[i % categories.length],
    sku: `SKU-${String(i + 1).padStart(6, '0')}`,
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    reviews: Math.floor(Math.random() * 500),
    stock: Math.floor(Math.random() * 1000),
    images: [
      `https://picsum.photos/seed/product${i + 1}a/400/400`,
      `https://picsum.photos/seed/product${i + 1}b/400/400`,
      `https://picsum.photos/seed/product${i + 1}c/400/400`,
    ],
    createdAt: new Date(2024, 0, 1 + i).toISOString(),
    metadata: {
      weight: `${(Math.random() * 10).toFixed(2)} kg`,
      dimensions: `${Math.floor(Math.random() * 50)}x${Math.floor(Math.random() * 50)}x${Math.floor(Math.random() * 50)} cm`,
      manufacturer: `Brand ${String.fromCharCode(65 + (i % 26))}`,
      warranty: `${Math.floor(Math.random() * 3) + 1} years`,
    },
    tags: [`tag-${i}`, `category-${categories[i % categories.length].toLowerCase()}`, 'all'],
  }))
}

export default defineEventHandler(() => {
  return generateProducts()
})
