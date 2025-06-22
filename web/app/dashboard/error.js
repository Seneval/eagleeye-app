'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import * as Sentry from '@sentry/nextjs'

export default function Error({ error, reset }) {
  const [errorId, setErrorId] = useState('')
  
  useEffect(() => {
    // Generate unique error ID for support
    const id = `err_${Date.now()}_${Math.random().toString(36).substring(7)}`
    setErrorId(id)
    
    // Enhanced error logging with user context
    Sentry.withScope((scope) => {
      // Add error boundary context
      scope.setTag('error_boundary', 'dashboard')
      scope.setTag('error_id', id)
      scope.setLevel('error')
      
      // Add user context if available
      const user = typeof window !== 'undefined' ? 
        JSON.parse(localStorage.getItem('sb-xnkvbfeoxcgsllxirtzx-auth-token') || '{}')?.user : null
      
      if (user) {
        scope.setUser({
          id: user.id,
          email: user.email
        })
      }
      
      // Add breadcrumbs for debugging
      scope.addBreadcrumb({
        category: 'ui.error',
        message: 'Dashboard error boundary triggered',
        level: 'error',
        data: {
          errorMessage: error?.message,
          errorStack: error?.stack?.substring(0, 200), // Limit stack trace length
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      })
      
      // Capture the exception
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: error?.componentStack
          },
          browser: {
            name: navigator.userAgent,
            online: navigator.onLine
          }
        }
      })
    })
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard error:', error)
    }
  }, [error])

  // Determine error type for better UX
  const isNetworkError = error?.message?.toLowerCase().includes('fetch') || 
                        error?.message?.toLowerCase().includes('network') ||
                        error?.message?.toLowerCase().includes('failed to fetch')
  
  const isAuthError = error?.message?.toLowerCase().includes('auth') || 
                     error?.message?.toLowerCase().includes('unauthorized') ||
                     error?.message?.toLowerCase().includes('401') ||
                     error?.message?.toLowerCase().includes('jwt')
                     
  const isRateLimitError = error?.message?.toLowerCase().includes('rate limit') ||
                          error?.message?.toLowerCase().includes('429')

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 p-8 max-w-md">
        <div className="text-5xl mb-4">
          {isNetworkError ? '🌐' : 
           isAuthError ? '🔒' : 
           isRateLimitError ? '⏱️' : '⚠️'}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900">
          {isNetworkError ? 'Connection Problem' : 
           isAuthError ? 'Authentication Required' : 
           isRateLimitError ? 'Too Many Requests' :
           'Something went wrong!'}
        </h2>
        
        <p className="text-gray-600">
          {isNetworkError ? 
            'Please check your internet connection and try again.' :
           isAuthError ? 
            'Your session has expired. Please sign in again to continue.' :
           isRateLimitError ?
            'You\'ve made too many requests. Please wait a moment and try again.' :
            'We\'ve been notified and are working on fixing this issue.'}
        </p>
        
        <div className="flex gap-4 justify-center pt-4">
          {isAuthError ? (
            <Button
              onClick={() => window.location.href = '/auth/login'}
              variant="primary"
            >
              Sign In Again
            </Button>
          ) : (
            <>
              <Button
                onClick={() => reset()}
                variant="primary"
                disabled={isRateLimitError}
              >
                {isRateLimitError ? 'Please Wait...' : 'Try Again'}
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="secondary"
              >
                Go to Dashboard
              </Button>
            </>
          )}
        </div>
        
        {/* Error details for development/beta */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Error details (development only)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}
        
        {/* Support information for beta testers */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Error ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{errorId}</code>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Include this ID when reporting issues
          </p>
        </div>
      </div>
    </div>
  )
}