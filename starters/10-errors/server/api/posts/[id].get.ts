const posts = [
  { id: 1, title: 'First Post', body: 'This is the first post content.' },
  { id: 2, title: 'Second Post', body: 'This is the second post content.' },
  { id: 3, title: 'Third Post', body: 'This is the third post content.' },
]

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))

  const post = posts.find((p) => p.id === id)

  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: `Post with id ${id} not found`,
    })
  }

  return post
})
