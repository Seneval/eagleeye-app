import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import * as Sentry from '@sentry/nextjs'

// Rate limiting for health checks
const healthCheckCalls = new Map()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_CALLS_PER_WINDOW = 60 // 1 per second

export async function GET(request) {
  const startTime = Date.now()
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  // Rate limiting
  const now = Date.now()
  const userCalls = healthCheckCalls.get(clientIp) || []
  const recentCalls = userCalls.filter(time => now - time < RATE_LIMIT_WINDOW)
  
  if (recentCalls.length >= MAX_CALLS_PER_WINDOW) {
    return NextResponse.json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((recentCalls[0] + RATE_LIMIT_WINDOW - now) / 1000)
    }, { 
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((recentCalls[0] + RATE_LIMIT_WINDOW - now) / 1000))
      }
    })
  }
  
  healthCheckCalls.set(clientIp, [...recentCalls, now])
  
  const checks = {
    database: 'unknown',
    openai: 'unknown',
    sentry: 'unknown',
    environment: {
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      sentry: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    }
  }

  // Check database connection with timeout
  try {
    const supabase = await createServerSupabaseClient()
    const dbCheckPromise = supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single()
    
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    )
    
    const { error } = await Promise.race([dbCheckPromise, timeout])
    // PGRST116 means no rows, which is fine for health check
    checks.database = error?.code === 'PGRST116' || !error ? 'ok' : 'error'
  } catch (error) {
    checks.database = 'error'
    Sentry.captureException(error, {
      tags: { component: 'health-check', check: 'database' }
    })
  }

  // Check OpenAI with minimal request
  if (checks.environment.openai) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const openAIResponse = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      checks.openai = openAIResponse.ok ? 'ok' : 'error'
    } catch (error) {
      checks.openai = 'error'
      if (error.name !== 'AbortError') {
        Sentry.captureException(error, {
          tags: { component: 'health-check', check: 'openai' }
        })
      }
    }
  }

  // Check Sentry
  if (checks.environment.sentry) {
    try {
      // Send a test breadcrumb (less noisy than a message)
      Sentry.addBreadcrumb({
        message: 'Health check ping',
        level: 'debug',
        category: 'health-check'
      })
      checks.sentry = 'ok'
    } catch (error) {
      checks.sentry = 'error'
    }
  }

  const responseTime = Date.now() - startTime
  const allHealthy = 
    checks.database === 'ok' && 
    checks.openai === 'ok' &&
    checks.sentry === 'ok' &&
    Object.values(checks.environment).every(v => v === true)

  // Clean up old rate limit entries periodically
  if (healthCheckCalls.size > 1000) {
    const oldestAllowed = now - RATE_LIMIT_WINDOW
    for (const [ip, calls] of healthCheckCalls.entries()) {
      const validCalls = calls.filter(time => time > oldestAllowed)
      if (validCalls.length === 0) {
        healthCheckCalls.delete(ip)
      } else {
        healthCheckCalls.set(ip, validCalls)
      }
    }
  }

  const response = {
    status: allHealthy ? 'ok' : 'unhealthy',
    timestamp: new Date().toISOString(),
    service: 'eagleeye-app',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0-beta',
    responseTime: `${responseTime}ms`,
    checks
  }

  // Add degraded details if not healthy
  if (!allHealthy) {
    response.degraded = []
    if (checks.database !== 'ok') response.degraded.push('database')
    if (checks.openai !== 'ok') response.degraded.push('openai')
    if (checks.sentry !== 'ok') response.degraded.push('sentry')
  }

  return NextResponse.json(response, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Response-Time': `${responseTime}ms`,
      'X-RateLimit-Limit': String(MAX_CALLS_PER_WINDOW),
      'X-RateLimit-Remaining': String(MAX_CALLS_PER_WINDOW - recentCalls.length - 1),
      'X-RateLimit-Reset': String(Math.ceil((recentCalls[0] + RATE_LIMIT_WINDOW) / 1000))
    }
  })
}