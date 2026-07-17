const limits = new Map<string, { count: number; resetAt: number }>()
const WINDOW = 60_000
const MAX = 30

export default defineEventHandler((event) => {
  const url = getRequestURL(event).pathname
  if (!url.startsWith('/api')) return

  const ip = getRequestIP(event) || 'unknown'
  const now = Date.now()
  let record = limits.get(ip)
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + WINDOW }
    limits.set(ip, record)
  }
  record.count++

  setHeader(event, 'X-RateLimit-Limit', String(MAX))
  setHeader(event, 'X-RateLimit-Remaining', String(Math.max(0, MAX - record.count)))

  if (record.count > MAX) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }
})
