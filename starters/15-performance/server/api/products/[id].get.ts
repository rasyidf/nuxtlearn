const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports']

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!id || id < 1 || id > 20) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
    })
  }

  const i = id - 1

  return {
    id,
    name: `Product ${id}`,
    description: `This is a detailed description for Product ${id}. It contains multiple sentences to simulate a real product listing with verbose content that adds weight to the API response payload.`,
    price: Math.round((Math.random() * 500 + 10) * 100) / 100,
    category: categories[i % categories.length],
    sku: `SKU-${String(id).padStart(6, '0')}`,
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    reviews: Math.floor(Math.random() * 500),
    stock: Math.floor(Math.random() * 1000),
    images: [
      `https://picsum.photos/seed/product${id}a/400/400`,
      `https://picsum.photos/seed/product${id}b/400/400`,
      `https://picsum.photos/seed/product${id}c/400/400`,
    ],
    createdAt: new Date(2024, 0, id).toISOString(),
    metadata: {
      weight: `${(Math.random() * 10).toFixed(2)} kg`,
      dimensions: `${Math.floor(Math.random() * 50)}x${Math.floor(Math.random() * 50)}x${Math.floor(Math.random() * 50)} cm`,
      manufacturer: `Brand ${String.fromCharCode(65 + (i % 26))}`,
      warranty: `${Math.floor(Math.random() * 3) + 1} years`,
    },
    tags: [`tag-${i}`, `category-${categories[i % categories.length].toLowerCase()}`, 'all'],
    relatedProducts: [
      ((i + 1) % 20) + 1,
      ((i + 2) % 20) + 1,
      ((i + 3) % 20) + 1,
    ],
  }
})
