// Environment variable validation
const requiredEnvVars = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: {
    description: 'Supabase project URL',
    example: 'https://xyzcompany.supabase.co'
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  
  // OpenAI
  OPENAI_API_KEY: {
    description: 'OpenAI API key for AI features',
    example: 'sk-...'
  },
  
  // Sentry (optional but recommended)
  NEXT_PUBLIC_SENTRY_DSN: {
    description: 'Sentry DSN for error tracking',
    example: 'https://...@sentry.io/...',
    optional: true
  }
}

function validateEnv() {
  const missing = []
  const warnings = []
  
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key]
    
    if (!value && !config.optional) {
      missing.push({
        key,
        ...config
      })
    } else if (!value && config.optional) {
      warnings.push({
        key,
        ...config
      })
    }
  }
  
  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:\n')
    missing.forEach(({ key, description, example }) => {
      console.error(`  ${key}`)
      console.error(`    Description: ${description}`)
      console.error(`    Example: ${example}\n`)
    })
    
    console.error('Please create a .env.local file with the required variables.')
    console.error('You can copy .env.example as a template.\n')
    
    // Only exit in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  Missing optional environment variables:\n')
    warnings.forEach(({ key, description }) => {
      console.warn(`  ${key}: ${description}`)
    })
    console.warn('')
  }
  
  // Additional validation for Supabase URL format
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
    } catch (error) {
      console.error('❌ Invalid NEXT_PUBLIC_SUPABASE_URL format. Must be a valid URL.')
      if (process.env.NODE_ENV === 'production') {
        process.exit(1)
      }
    }
  }
  
  return { missing, warnings }
}

// Run validation
if (typeof window === 'undefined' && !process.env.SKIP_ENV_VALIDATION) {
  validateEnv()
}

module.exports = { validateEnv }