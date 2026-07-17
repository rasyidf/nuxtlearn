export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: config.public.appVersion,
    environment: process.env.NODE_ENV || 'development',
  }
})
