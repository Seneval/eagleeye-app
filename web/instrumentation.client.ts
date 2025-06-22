import * as Sentry from "@sentry/nextjs";

// Client-side Sentry configuration
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session Replay for beta testing
  integrations: [
    Sentry.replayIntegration({
      // Only record 10% of sessions in production
      sessionSampleRate: 0.1,
      // Record 100% of sessions with errors
      errorSampleRate: 1.0,
      // Mask sensitive content
      maskAllText: false,
      maskAllInputs: true,
      // Block certain elements
      blockSelector: '[data-sensitive]',
    }),
  ],
  
  // Capture unhandled promise rejections
  captureUnhandledRejections: true,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0-beta',
  
  // Before send hook
  beforeSend(event, hint) {
    // Add browser context
    if (typeof window !== 'undefined') {
      event.contexts = {
        ...event.contexts,
        browser: {
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          user_agent: navigator.userAgent,
          online: navigator.onLine,
        },
      };
    }
    
    // Filter out non-app errors
    if (event.exception?.values?.[0]?.stacktrace?.frames) {
      const frames = event.exception.values[0].stacktrace.frames;
      const hasAppFrame = frames.some(frame => 
        frame.filename && frame.filename.includes('/_next/')
      );
      
      if (!hasAppFrame) {
        // This is likely a browser extension error
        return null;
      }
    }
    
    return event;
  },
  
  // Transport options
  transportOptions: {
    // Retry failed requests
    fetchOptions: {
      keepalive: true,
    },
  },
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
});