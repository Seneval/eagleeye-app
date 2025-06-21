# Supabase Setup Guide for EagleEye

## Quick Setup Steps

### 1. Apply Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/xnkvbfeoxcgsllxirtzx
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the entire contents of `supabase-schema.sql`
5. Click "Run" to execute the SQL

### 2. Enable Authentication

1. Go to "Authentication" → "Providers" in your Supabase dashboard
2. Enable "Email" provider if not already enabled
3. Make sure these settings are configured:
   - Enable email confirmations: OFF (for easier testing)
   - Minimum password length: 6

### 3. Check Authentication Settings

1. Go to "Authentication" → "URL Configuration"
2. Make sure the Site URL is set to: `http://localhost:3000`
3. Add these to Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000`

### 4. Verify API Settings

1. Go to "Settings" → "API"
2. Make sure your Project URL matches: `https://xnkvbfeoxcgsllxirtzx.supabase.co`
3. Verify your anon key starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Running the App Locally (without Docker)

If you want to run the app directly with npm:

```bash
cd web
npm run dev
```

## Troubleshooting

### "Invalid API Key" Error
- Double-check that your .env.local file has the correct SUPABASE_URL and SUPABASE_ANON_KEY
- Make sure there are no extra spaces or quotes around the values

### Can't Create Account
- Make sure the database schema has been applied (Step 1)
- Check that email provider is enabled in Authentication settings
- Verify the trigger for creating profiles is working by checking the SQL Editor logs

### Login Not Working
- Clear your browser cookies for localhost:3000
- Check the browser console for any errors
- Make sure the Site URL in Supabase matches where you're accessing the app

## Testing the Setup

1. After applying the schema, you can test it:
   ```sql
   -- Check if tables were created
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. You should see these tables:
   - profiles
   - daily_todos
   - business_goals
   - business_context
   - ai_chats

3. Test the trigger by creating a test user in Authentication → Users → Invite User