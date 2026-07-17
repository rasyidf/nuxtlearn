export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    public: config.public,
  }
})
