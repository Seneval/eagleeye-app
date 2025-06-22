import { createLogger } from './logger'

const logger = createLogger('rate-limit')

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map()

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > data.windowMs * 2) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean every minute

export class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000 // 1 minute default
    this.maxRequests = options.maxRequests || 60 // 60 requests per window
    this.keyPrefix = options.keyPrefix || 'rl'
    this.skipSuccessfulRequests = options.skipSuccessfulRequests || false
    this.skipFailedRequests = options.skipFailedRequests || false
  }

  getKey(identifier) {
    return `${this.keyPrefix}:${identifier}`
  }

  async check(identifier, request) {
    const key = this.getKey(identifier)
    const now = Date.now()
    
    let data = rateLimitStore.get(key)
    
    if (!data || now - data.windowStart > this.windowMs) {
      // New window
      data = {
        windowStart: now,
        requests: []
      }
    }
    
    // Remove old requests outside the window
    data.requests = data.requests.filter(
      timestamp => now - timestamp < this.windowMs
    )
    
    // Check if limit exceeded
    if (data.requests.length >= this.maxRequests) {
      const oldestRequest = data.requests[0]
      const resetTime = oldestRequest + this.windowMs
      const retryAfter = Math.ceil((resetTime - now) / 1000)
      
      logger.warn('Rate limit exceeded', {
        identifier,
        requests: data.requests.length,
        limit: this.maxRequests,
        retryAfter
      })
      
      return {
        allowed: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: resetTime,
        retryAfter
      }
    }
    
    // Add current request
    data.requests.push(now)
    rateLimitStore.set(key, data)
    
    const remaining = this.maxRequests - data.requests.length
    const reset = data.windowStart + this.windowMs
    
    return {
      allowed: true,
      limit: this.maxRequests,
      remaining,
      reset,
      retryAfter: 0
    }
  }

  // Middleware for API routes
  middleware(options = {}) {
    const keyGenerator = options.keyGenerator || ((req) => {
      // Use IP address as default identifier
      return req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             req.ip ||
             'unknown'
    })

    return async (request) => {
      const identifier = keyGenerator(request)
      const result = await this.check(identifier, request)
      
      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
            retryAfter: result.retryAfter
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': String(result.limit),
              'X-RateLimit-Remaining': String(result.remaining),
              'X-RateLimit-Reset': String(result.reset),
              'Retry-After': String(result.retryAfter)
            }
          }
        )
      }
      
      // Add rate limit headers to response
      return {
        headers: {
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(result.reset)
        }
      }
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // Strict limit for auth endpoints
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: 'auth'
  }),
  
  // Standard API limit
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    keyPrefix: 'api'
  }),
  
  // AI endpoints (expensive operations)
  ai: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyPrefix: 'ai'
  }),
  
  // Health check endpoint
  health: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    keyPrefix: 'health'
  })
}

// Helper to get client IP
export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return request.headers.get('x-real-ip') || 
         request.ip || 
         'unknown'
}

// Apply rate limiting to a handler
export function withRateLimit(handler, limiter) {
  return async (request, context) => {
    const ip = getClientIp(request)
    const result = await limiter.check(ip, request)
    
    if (!result.allowed) {
      logger.warn('Rate limit blocked request', {
        ip,
        endpoint: request.url,
        remaining: result.remaining
      })
      
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(result.reset),
            'Retry-After': String(result.retryAfter)
          }
        }
      )
    }
    
    // Call the actual handler
    const response = await handler(request, context)
    
    // Add rate limit headers to response
    const headers = new Headers(response.headers)
    headers.set('X-RateLimit-Limit', String(result.limit))
    headers.set('X-RateLimit-Remaining', String(result.remaining))
    headers.set('X-RateLimit-Reset', String(result.reset))
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    })
  }
}