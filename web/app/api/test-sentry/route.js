import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { apiLogger } from '@/lib/logger'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'test'
  
  try {
    switch (type) {
      case 'test':
        // Send a test message
        Sentry.captureMessage('Sentry test message from API route', 'info')
        apiLogger.info('Sentry test message sent')
        
        return NextResponse.json({
          message: 'Test message sent to Sentry',
          timestamp: new Date().toISOString(),
          instructions: 'Check your Sentry dashboard for this message'
        })
        
      case 'error':
        // Trigger a test error
        throw new Error('This is a test error for Sentry')
        
      case 'warning':
        // Send a warning
        Sentry.captureMessage('Test warning from EagleEye', 'warning')
        return NextResponse.json({
          message: 'Warning sent to Sentry',
          level: 'warning'
        })
        
      case 'user':
        // Test with user context
        Sentry.withScope((scope) => {
          scope.setUser({
            id: 'test-user-123',
            email: 'test@example.com'
          })
          scope.setTag('test_type', 'user_context')
          scope.setContext('test_data', {
            timestamp: new Date().toISOString(),
            source: 'test-sentry-route'
          })
          
          Sentry.captureMessage('Test message with user context', 'info')
        })
        
        return NextResponse.json({
          message: 'Message with user context sent',
          user: 'test-user-123'
        })
        
      case 'performance':
        // Test performance monitoring
        const transaction = Sentry.startTransaction({
          op: 'test',
          name: 'Test Transaction'
        })
        
        Sentry.getCurrentHub().configureScope(scope => scope.setSpan(transaction))
        
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 100))
        
        transaction.finish()
        
        return NextResponse.json({
          message: 'Performance transaction sent',
          duration: '100ms'
        })
        
      default:
        return NextResponse.json({
          message: 'Unknown test type',
          available: ['test', 'error', 'warning', 'user', 'performance']
        })
    }
  } catch (error) {
    // This error will be caught by Sentry
    Sentry.captureException(error)
    
    return NextResponse.json({
      message: 'Error captured and sent to Sentry',
      error: error.message,
      instructions: 'Check your Sentry dashboard for the full error details'
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Test custom error with metadata
    const error = new Error(body.message || 'Custom test error')
    
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'custom_test')
      scope.setLevel('error')
      
      if (body.user) {
        scope.setUser(body.user)
      }
      
      if (body.extra) {
        scope.setContext('custom_data', body.extra)
      }
      
      Sentry.captureException(error)
    })
    
    return NextResponse.json({
      message: 'Custom error sent to Sentry',
      details: body
    })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}