// Enhanced environment variable validation for beta testing
const requiredEnvVars = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: {
    description: 'Supabase project URL',
    example: 'https://xyzcompany.supabase.co',
    validate: (value) => {
      if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
        return 'Must be a valid Supabase URL (https://[project-ref].supabase.co)'
      }
      // Extract and validate project ref
      const projectRef = value.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1]
      if (!projectRef || projectRef.length < 20) {
        return 'Project reference appears invalid'
      }
      return null
    }
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    validate: (value) => {
      if (!value.includes('eyJ') || value.length < 100) {
        return 'Must be a valid JWT token'
      }
      // Basic JWT structure validation
      const parts = value.split('.')
      if (parts.length !== 3) {
        return 'Invalid JWT format'
      }
      return null
    }
  },
  
  // OpenAI
  OPENAI_API_KEY: {
    description: 'OpenAI API key for AI features',
    example: 'sk-proj-...',
    validate: (value) => {
      if (!value.startsWith('sk-')) {
        return 'Must start with "sk-"'
      }
      if (value.length < 40) {
        return 'API key appears too short'
      }
      // Check for common placeholder values
      if (value.includes('your') || value.includes('YOUR') || 
          value === 'sk-...' || value.includes('xxx')) {
        return 'Appears to be a placeholder value'
      }
      return null
    }
  },
  
  // Sentry (required for beta)
  NEXT_PUBLIC_SENTRY_DSN: {
    description: 'Sentry DSN for error tracking (required for beta)',
    example: 'https://abc123@o123456.ingest.sentry.io/123456',
    required: true, // Now required for beta
    validate: (value) => {
      if (!value.startsWith('https://')) {
        return 'Must be a valid HTTPS URL'
      }
      if (!value.includes('@') || !value.includes('sentry.io')) {
        return 'Must be a valid Sentry DSN'
      }
      // Validate DSN structure (supports regional endpoints)
      const dsnPattern = /^https:\/\/[a-f0-9]+@[a-z0-9-]+\.ingest(\.[a-z]+)?\.sentry\.io\/\d+$/
      if (!dsnPattern.test(value)) {
        return 'Invalid Sentry DSN format'
      }
      return null
    }
  },
  
  // App version for tracking
  NEXT_PUBLIC_APP_VERSION: {
    description: 'App version for tracking',
    example: '1.0.0-beta',
    optional: true,
    default: '1.0.0-beta',
    validate: (value) => {
      if (value && !/^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/.test(value)) {
        return 'Must follow semantic versioning (e.g., 1.0.0-beta)'
      }
      return null
    }
  }
}

function validateEnv() {
  const errors = []
  const warnings = []
  const info = []
  
  // Skip validation in production build (Vercel will handle it)
  if (process.env.VERCEL) {
    return { errors, warnings, info }
  }
  
  console.log('\n🔍 Validating environment variables for beta...\n')
  
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key]
    
    if (!value && !config.optional) {
      errors.push({
        key,
        message: 'Missing required variable',
        ...config
      })
    } else if (!value && config.optional) {
      warnings.push({
        key,
        message: `Optional variable not set${config.default ? ` (using default: ${config.default})` : ''}`,
        ...config
      })
    } else if (value && config.validate) {
      const validationError = config.validate(value)
      if (validationError) {
        errors.push({
          key,
          message: validationError,
          ...config
        })
      } else {
        info.push({
          key,
          message: '✓ Valid'
        })
      }
    } else if (value) {
      info.push({
        key,
        message: '✓ Set'
      })
    }
  }
  
  // Display validation results
  if (info.length > 0 && process.env.NODE_ENV === 'development') {
    console.log('✅ Valid environment variables:')
    info.forEach(({ key, message }) => {
      console.log(`  ${key}: ${message}`)
    })
    console.log('')
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Warnings:')
    warnings.forEach(({ key, message, description }) => {
      console.warn(`  ${key}: ${message}`)
      console.warn(`    ${description}`)
    })
    console.warn('')
  }
  
  if (errors.length > 0) {
    console.error('❌ Environment validation errors:')
    errors.forEach(({ key, message, description, example }) => {
      console.error(`  ${key}: ${message}`)
      console.error(`    Description: ${description}`)
      console.error(`    Example: ${example}`)
    })
    
    console.error('\n📝 Please check your .env.local file')
    console.error('   You can copy .env.example as a template\n')
    
    // Exit in production or if critical errors
    if (process.env.NODE_ENV === 'production' || process.env.CI) {
      console.error('🚫 Cannot start with invalid environment configuration')
      process.exit(1)
    } else {
      console.warn('⚠️  Continuing in development mode despite errors')
    }
  } else {
    console.log('✅ All environment variables validated successfully!\n')
  }
  
  return { errors, warnings }
}

// Additional runtime checks
function checkRuntimeEnvironment() {
  // Check Node version
  const nodeVersion = process.versions.node
  const majorVersion = parseInt(nodeVersion.split('.')[0])
  if (majorVersion < 18) {
    console.warn(`⚠️  Node.js ${nodeVersion} detected. Recommend v18+ for best performance.`)
  }
  
  // Check memory limits
  const memoryLimit = process.memoryUsage().heapTotal / 1024 / 1024
  if (memoryLimit < 512) {
    console.warn('⚠️  Low memory limit detected. May impact performance with multiple users.')
  }
}

// Run validation
if (typeof window === 'undefined' && !process.env.SKIP_ENV_VALIDATION) {
  validateEnv()
  checkRuntimeEnvironment()
}

module.exports = { validateEnv, checkRuntimeEnvironment }