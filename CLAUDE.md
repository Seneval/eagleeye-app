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
- **Environment**: Development (ready for production setup)
- **Next Steps**: Configure source maps for Next.js

### Docker Configuration
- **MCP Server**: Running (container: goofy_banzai)
- **Status**: Active and ready for use
- **Next Steps**: Create development containers for the app

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

# Deploy Supabase function
mcp__supabase__deploy_edge_function(name='ai-bot', files=[...])

# Create Stripe product
mcp__stripe__create_product(name='EagleEye Premium')
```

## Notes
- All MCPs are currently connected and functional
- Sentry project created but needs SDK integration in code
- Docker MCP server is running and ready
- Remember to use environment variables for all credentials