# EagleEye SaaS Project - MCP Documentation

## Project Overview
- **Name**: EagleEye
- **Description**: Productivity web app for SME owners and freelancers
- **Tech Stack**: Next.js, Supabase, Tailwind CSS, OpenAI API, Stripe
- **Target Audience**: Small/medium enterprise owners and freelancers

## Available MCP Tools (6 Total)

### 1. Sentry MCP - Error Monitoring & Performance
**Status**: ✅ Connected | Project "eagleeye-app" created
**DSN**: `https://98bc66bd36fd044ab79837dea01354ac@o4509528924160000.ingest.us.sentry.io/4509529127059456`
**Tools**: 15 tools available

**When to use**:
- **Production Monitoring**: Track errors in real-time when the app is live
- **Performance Issues**: Monitor slow API calls, database queries, or frontend rendering
- **User Impact Analysis**: See how many users are affected by specific issues
- **Release Tracking**: Monitor issues by release version
- **AI Error Analysis**: Use Seer to analyze and suggest fixes for complex errors
- **Team Collaboration**: Assign issues to team members, update status, add comments

**Key tools**:
- `find_issues`: Search for errors by project, status, or user impact
- `get_issue_details`: Get full stacktraces and error context
- `update_issue`: Mark issues as resolved or assign to team
- `begin_seer_issue_fix`: AI-powered root cause analysis
- `find_errors`: Search errors by filename or transaction
- `create_dsn`: Create new DSN for different environments

### 2. Docker MCP - Container Management
**Status**: ✅ Connected | MCP server container running (goofy_banzai)
**Tools**: 20 tools available

**When to use**:
- **Development Environment**: Create consistent dev containers for the team
- **Microservices**: Deploy each AI bot (marketing, ads, design, accounting) as separate containers
- **Database Services**: Run PostgreSQL, Redis, or other services in containers
- **Scaling**: Spin up multiple container instances based on load
- **Testing**: Create isolated test environments
- **CI/CD**: Build and push images for deployment

**Key tools**:
- `run_container`: Quick container deployment with auto-configuration
- `recreate_container`: Update running containers with new configurations
- `fetch_container_logs`: Debug issues in containerized services
- `build_image`: Create custom images for AI bot services
- `create_network`: Set up networking between microservices
- `create_volume`: Persistent storage for databases and uploads

### 3. Supabase MCP - Database & Backend
**Status**: ✅ Connected
**Tools**: 17 tools available

**When to use**:
- **Database Schema**: Create tables for users, tasks, goals, subscriptions
- **Authentication**: Set up user registration and login
- **Real-time Features**: Enable live updates for AI chat responses
- **Row Level Security**: Implement multi-tenancy (users only see their data)
- **Edge Functions**: Deploy serverless functions for AI bot logic
- **Migrations**: Version control database changes
- **TypeScript Types**: Generate types from database schema

**Key tools**:
- `list_tables`: View current database structure
- `apply_migration`: Execute DDL for schema changes
- `execute_sql`: Run queries for data operations
- `deploy_edge_function`: Deploy AI bot handlers
- `get_advisors`: Check for security vulnerabilities
- `generate_typescript_types`: Keep frontend types in sync
- `search_docs`: Find implementation examples

### 4. Stripe MCP - Payment Processing
**Status**: ✅ Connected
**Tools**: 19 tools available

**When to use**:
- **Product Setup**: Create free and paid tier products
- **Pricing**: Set up monthly/annual pricing for premium features
- **Customer Management**: Track user subscriptions
- **Payment Links**: Generate checkout URLs
- **Subscription Management**: Handle upgrades, downgrades, cancellations
- **Refunds**: Process refunds when needed
- **Revenue Analytics**: Monitor MRR and churn

**Key tools**:
- `create_product`: Set up "EagleEye Premium" product
- `create_price`: Configure pricing tiers
- `create_payment_link`: Generate checkout pages
- `list_subscriptions`: Monitor active subscriptions
- `update_subscription`: Handle plan changes
- `create_coupon`: Promotional discounts
- `search_stripe_documentation`: Find implementation guides

### 5. Context7 MCP - Documentation Access
**Status**: ✅ Connected
**Tools**: 2 tools available

**When to use**:
- **Library Research**: Get latest docs for Next.js, Supabase, etc.
- **API Reference**: Look up specific function signatures
- **Best Practices**: Find recommended implementation patterns
- **Version Compatibility**: Check feature availability
- **Code Examples**: Find official implementation examples

**Key tools**:
- `resolve-library-id`: Find library identifiers
- `get-library-docs`: Fetch specific documentation

### 6. IDE MCP - Code Execution
**Status**: ✅ Connected
**Tools**: 2 tools available

**When to use**:
- **Data Processing**: Run Python scripts for analytics
- **AI Model Testing**: Test OpenAI API integrations
- **Code Diagnostics**: Check for syntax errors
- **Prototyping**: Quick code experiments

**Key tools**:
- `executeCode`: Run Python code in Jupyter kernel
- `getDiagnostics`: Get language server diagnostics

## Infrastructure Status

### Sentry Configuration
- **Organization**: Available (check with `find_organizations`)
- **Project**: eagleeye-app (JavaScript platform)
- **Environment**: Production-ready with full SDK integration
- **Status**: ✅ Fully integrated with Next.js 15 using instrumentation.ts
- **Features Enabled**:
  - Error tracking with user context (no PII)
  - Performance monitoring with transaction tracking
  - Session replay for error reproduction
  - Custom error boundaries
  - Beta version tracking (1.0.0-beta)
- **Testing**: Visit `/dashboard/test-sentry` to verify integration

### Docker Configuration
- **MCP Server**: Running (container: goofy_banzai)
- **Status**: Active and ready for use
- **Health Check**: Comprehensive validation with rate limiting
- **Container Testing**: Full app containerization tested
- **Production Ready**: Environment validation and service checks implemented

## Production Features (Beta-Ready)

### Rate Limiting System
- **Implementation**: `/web/lib/rate-limit.js`
- **Configuration**:
  - Auth endpoints: 5 requests per 15 minutes
  - API endpoints: 60 requests per minute
  - AI endpoints: 10 requests per minute
  - Health check: 60 requests per minute
- **Features**: In-memory storage (Redis-ready), automatic cleanup, standard headers
- **Usage**: All API routes protected with `withRateLimit` wrapper

### Structured Logging
- **Implementation**: `/web/lib/logger.js`
- **Components**: auth, api, database, ai, ui
- **Features**:
  - User context tracking (no PII)
  - Performance timing
  - API call monitoring
  - Sentry breadcrumb integration
  - Action tracking for debugging

### Environment Validation
- **Implementation**: `/web/lib/env-check.js`
- **Features**:
  - Comprehensive validation for all required variables
  - Format checking (URLs, JWTs, API keys)
  - Placeholder detection
  - Runtime environment checks
  - Detailed error messages with examples

### Health Monitoring
- **Endpoint**: `/api/health`
- **Checks**: Database, OpenAI API, Sentry integration
- **Features**: Service validation, rate limiting, version info, degraded state detection

### Error Boundaries
- **Enhanced**: `/web/app/dashboard/error.js`
- **Features**:
  - Intelligent error type detection
  - User-friendly messages
  - Error ID generation for support
  - Contextual recovery actions
  - Beta tester support info

## Beta Testing Infrastructure

### Sentry Testing
- **UI Testing**: `/dashboard/test-sentry` - Interactive testing interface
- **API Testing**: `/api/test-sentry` - Direct API endpoint testing
- **Test Types**:
  - Client-side errors
  - API errors
  - Unhandled promise rejections
  - Custom error messages
  - Performance tracking

### Version Tracking
- **Current Version**: 1.0.0-beta
- **Tracking**: Version included in all error reports and health checks
- **User Context**: Anonymous user ID tracking for debugging

### Support Features
- **Error IDs**: Unique identifiers for each error occurrence
- **User Actions**: Tracked in breadcrumbs for reproduction
- **Performance Metrics**: API response times and database query performance

## Security Enhancements

### Data Protection
- **PII Handling**: No personal information in error reports
- **User Context**: Only anonymous IDs tracked
- **Sensitive Data**: All API keys and tokens validated and masked

### API Security
- **Rate Limiting**: Protection against abuse on all endpoints
- **Environment Variables**: Comprehensive validation with format checking
- **Error Messages**: Sanitized to prevent information leakage

### Authentication
- **JWT Validation**: Proper token format checking
- **Session Security**: Secure cookie handling
- **Auth Rate Limiting**: Stricter limits on authentication endpoints

## Deployment Configuration

### Vercel Setup
- **Configuration**: `/web/vercel.json`
- **Region**: iad1 (US East)
- **Function Limits**: 60s for API routes, 10s for others
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Environment Variables
Required variables (see `/web/.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Production Optimizations
- **Sentry Sample Rates**: 10% traces, 10% profiles in production
- **Error Filtering**: Browser extensions and network errors filtered
- **Performance Monitoring**: Critical transactions tracked
- **Static Generation**: Disabled for dashboard pages (dynamic content)

## Critical Fixes Applied

### Database Stability
- **Issue**: `.single()` queries causing crashes
- **Fix**: Replaced with `.limit(1)` for null-safe queries
- **Files**: All API routes and components

### Dynamic Rendering
- **Issue**: "cookies" error during static generation
- **Fix**: Added `export const dynamic = 'force-dynamic'` to dashboard pages
- **Affected**: All `/dashboard/*` pages

### Null Safety
- **Issue**: Crashes on missing data
- **Fix**: Comprehensive null checks and array validation
- **Implementation**: Optional chaining and default values throughout

### Next.js 15 Compatibility
- **Issue**: Async params in route handlers
- **Fix**: Proper async/await handling in API routes
- **Migration**: Updated to new App Router patterns

## Project-Specific Reminders

### Architecture Considerations
1. **Multi-tenancy**: Use Supabase RLS for data isolation
2. **AI Bots**: Consider containerizing each bot for independent scaling
3. **Real-time**: Use Supabase subscriptions for chat features
4. **Caching**: Implement Redis in Docker for API response caching

### Development Workflow
1. Use Docker for consistent dev environments
2. Monitor errors with Sentry during development
3. Test payment flows with Stripe test mode
4. Document API integrations with Context7
5. Prototype AI features with IDE MCP

### Security Best Practices
1. Never commit API keys (use environment variables)
2. Enable Supabase RLS on all tables
3. Use Sentry to monitor suspicious activities
4. Implement rate limiting on AI bot endpoints
5. Regular security audits with Supabase advisors

## Common MCP Combinations

### Setting up Authentication
1. Supabase: Create auth tables and policies
2. Stripe: Create customer on signup
3. Sentry: Track auth errors

### Deploying AI Bots
1. Docker: Create container for bot service
2. Supabase: Deploy edge function
3. Sentry: Monitor bot performance

### Payment Integration
1. Stripe: Create products and prices
2. Supabase: Store subscription status
3. Docker: Deploy webhook handler

## Quick Commands Reference

```bash
# Check Docker containers
mcp__Docker__list_containers(all=true)

# View Sentry issues
mcp__Sentry__find_issues(organizationSlug='your-org', query='is:unresolved')

# Test Sentry integration
mcp__Sentry__get_issue_details(organizationSlug='your-org', issueId='ISSUE-ID')

# Check security advisors
mcp__supabase__get_advisors(type='security')

# Deploy Supabase function
mcp__supabase__deploy_edge_function(name='ai-bot', files=[...])

# Create Stripe product
mcp__stripe__create_product(name='EagleEye Premium')

# Health check verification
curl https://your-app.vercel.app/api/health

# Test Sentry manually
curl https://your-app.vercel.app/api/test-sentry?type=error

# Validate environment
node web/lib/env-check.js

# Check rate limit headers
curl -I https://your-app.vercel.app/api/todos
```

## Notes
- All MCPs are currently connected and functional
- Sentry SDK is fully integrated with Next.js 15 instrumentation
- Docker MCP server is running and production-tested
- Rate limiting implemented on all API endpoints
- Health monitoring available at `/api/health`
- Environment validation ensures all required variables are set
- Beta testing infrastructure ready with error tracking
- Production deployment configured for Vercel
- Remember to use environment variables for all credentials

## Recent Updates (Beta Release)
- ✅ Migrated Sentry to instrumentation.ts pattern
- ✅ Implemented comprehensive rate limiting
- ✅ Added structured logging with user context
- ✅ Enhanced error boundaries with recovery actions
- ✅ Fixed all critical stability issues
- ✅ Added health check with service validation
- ✅ Created Sentry testing infrastructure
- ✅ Configured production deployment settings
- ✅ Applied Next.js 15 compatibility fixes
- ✅ Implemented comprehensive null safety