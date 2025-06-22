import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Initialize Sentry for all runtimes (server, edge, client)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side configuration
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      
      // Performance Monitoring for beta testing
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      
      // Session tracking for user analytics
      autoSessionTracking: true,
      
      // Profile sample rate for performance issues
      profilesSampleRate: 0.1,
      
      // Capture console errors
      integrations: [
        Sentry.captureConsoleIntegration({
          levels: ['error', 'warn']
        }),
      ],
      
      // Environment configuration
      environment: process.env.NODE_ENV,
      
      // Filter out noise
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        // Random network errors
        'Network request failed',
        'NetworkError',
        // User cancellations
        'AbortError',
      ],
      
      // Before send hook for PII protection
      beforeSend(event, hint) {
        // Remove sensitive data
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        
        // Add user context without PII
        if (event.user) {
          event.user = {
            id: event.user.id,
            // Don't send email or other PII
          };
        }
        
        // For beta testing, add extra context
        if (event.extra) {
          event.extra.beta_version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0-beta';
        }
        
        return event;
      },
      
      // Before send transaction for performance
      beforeSendTransaction(transaction) {
        // Add beta testing context
        transaction.tags = {
          ...transaction.tags,
          beta_test: 'true',
          runtime: process.env.NEXT_RUNTIME,
        };
        
        return transaction;
      },
    });
  }
  
  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime configuration
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      
      // Lower sample rate for edge functions
      tracesSampleRate: 0.1,
      
      // Environment
      environment: process.env.NODE_ENV,
      
      // Edge-specific configuration
      transportOptions: {
        // Shorter timeout for edge functions
        fetchOptions: {
          timeout: 5000,
        },
      },
    });
  }
}

// Export configuration for client-side
export const onRequestError = Sentry.captureRequestError;