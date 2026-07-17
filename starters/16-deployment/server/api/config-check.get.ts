export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    publicConfig: config.public,
    hasSecret: !!config.apiSecret,
  }
})
