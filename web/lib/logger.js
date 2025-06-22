import * as Sentry from '@sentry/nextjs'

// Structured logging for beta testing with user context
class Logger {
  constructor(component) {
    this.component = component
  }

  // Get user context safely
  getContext() {
    const context = {
      component: this.component,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0-beta'
    }

    // Add user context in browser
    if (typeof window !== 'undefined') {
      try {
        const authToken = localStorage.getItem('sb-xnkvbfeoxcgsllxirtzx-auth-token')
        if (authToken) {
          const parsed = JSON.parse(authToken)
          if (parsed?.user) {
            context.userId = parsed.user.id
            context.userEmail = parsed.user.email
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
      
      // Add browser context
      context.browser = {
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      }
    }

    return context
  }

  // Log levels
  info(message, data = {}) {
    const logData = {
      level: 'info',
      message,
      ...this.getContext(),
      data
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.component}]`, message, data)
    }

    // Send breadcrumb to Sentry
    Sentry.addBreadcrumb({
      category: this.component,
      message,
      level: 'info',
      data
    })

    return logData
  }

  warn(message, data = {}) {
    const logData = {
      level: 'warn',
      message,
      ...this.getContext(),
      data
    }

    console.warn(`[${this.component}]`, message, data)

    // Send to Sentry as breadcrumb
    Sentry.addBreadcrumb({
      category: this.component,
      message,
      level: 'warning',
      data
    })

    return logData
  }

  error(message, error = null, data = {}) {
    const logData = {
      level: 'error',
      message,
      ...this.getContext(),
      data,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null
    }

    console.error(`[${this.component}]`, message, error, data)

    // Send to Sentry with context
    if (error) {
      Sentry.withScope((scope) => {
        scope.setTag('component', this.component)
        scope.setLevel('error')
        
        // Add user context
        const context = this.getContext()
        if (context.userId) {
          scope.setUser({
            id: context.userId,
            email: context.userEmail
          })
        }
        
        // Add extra context
        scope.setContext('logger', logData)
        
        Sentry.captureException(error, {
          extra: data
        })
      })
    } else {
      Sentry.captureMessage(message, 'error')
    }

    return logData
  }

  // Track performance
  startTimer(operation) {
    const startTime = performance.now()
    
    return {
      end: (data = {}) => {
        const duration = performance.now() - startTime
        
        const perfData = {
          operation,
          duration: `${duration.toFixed(2)}ms`,
          ...data
        }

        this.info(`${operation} completed`, perfData)

        // Send performance data to Sentry
        if (duration > 1000) { // Log slow operations
          Sentry.addBreadcrumb({
            category: 'performance',
            message: `Slow operation: ${operation}`,
            level: 'warning',
            data: perfData
          })
        }

        return perfData
      }
    }
  }

  // Track user actions
  trackAction(action, data = {}) {
    const actionData = {
      action,
      ...this.getContext(),
      data
    }

    this.info(`User action: ${action}`, data)

    // Send to Sentry as breadcrumb
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: action,
      level: 'info',
      data
    })

    return actionData
  }

  // Track API calls
  async trackAPI(method, endpoint, fn) {
    const timer = this.startTimer(`API ${method} ${endpoint}`)
    
    try {
      const result = await fn()
      timer.end({ status: 'success' })
      return result
    } catch (error) {
      timer.end({ 
        status: 'error',
        error: error.message 
      })
      this.error(`API error: ${method} ${endpoint}`, error)
      throw error
    }
  }
}

// Create loggers for different components
export const createLogger = (component) => new Logger(component)

// Pre-configured loggers
export const authLogger = createLogger('auth')
export const apiLogger = createLogger('api')
export const dbLogger = createLogger('database')
export const aiLogger = createLogger('ai')
export const uiLogger = createLogger('ui')

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const logger = createLogger('global')
    logger.error('Unhandled promise rejection', event.reason)
  })
}