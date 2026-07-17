export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const deleted = deleteItem(id)
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  }
  return { deleted: true }
})
