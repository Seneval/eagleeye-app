import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Check basic app health
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'eagleeye-app',
      version: process.env.npm_package_version || '1.0.0',
      checks: {}
    }

    // Check Supabase connection
    try {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase.from('profiles').select('count').limit(1)
      health.checks.database = error ? 'error' : 'ok'
      if (error) {
        health.checks.databaseError = error.message
      }
    } catch (error) {
      health.checks.database = 'error'
      health.checks.databaseError = error.message
    }

    // Check environment variables
    health.checks.environment = {
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      openai: !!process.env.OPENAI_API_KEY,
      sentry: !!process.env.NEXT_PUBLIC_SENTRY_DSN
    }

    // Overall health status
    const hasErrors = Object.values(health.checks).some(
      check => check === 'error' || (typeof check === 'object' && Object.values(check).includes(false))
    )
    
    health.status = hasErrors ? 'degraded' : 'ok'

    return NextResponse.json(health, { 
      status: health.status === 'ok' ? 200 : 503 
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}