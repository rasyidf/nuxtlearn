export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  return {
    id: Number(id),
    title: `Post ${id}`,
    content: `Full content of post ${id}. This came from a server route.`,
    createdAt: new Date().toISOString(),
  }
})
