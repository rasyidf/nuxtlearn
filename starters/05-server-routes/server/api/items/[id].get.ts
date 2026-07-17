export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const item = getItem(id)
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  }
  return item
})
