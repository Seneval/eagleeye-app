# How to Apply the Database Migration in Supabase

## Quick Steps

1. **Go to your Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your EagleEye project

2. **Navigate to SQL Editor**
   - In the left sidebar, click on "SQL Editor" (it has a code icon)
   - Click "New query" button

3. **Copy and Paste this SQL**
   ```sql
   -- Add missing columns to business_context table
   ALTER TABLE business_context 
   ADD COLUMN IF NOT EXISTS business_description TEXT,
   ADD COLUMN IF NOT EXISTS products_services JSONB DEFAULT '[]'::jsonb,
   ADD COLUMN IF NOT EXISTS value_proposition TEXT,
   ADD COLUMN IF NOT EXISTS business_model TEXT;
   ```

4. **Run the Query**
   - Click the "Run" button (or press Cmd/Ctrl + Enter)
   - You should see "Success. No rows returned" message

## Visual Guide

### Step 1: Find SQL Editor
![SQL Editor Location](https://supabase.com/docs/img/guides/database/sql-editor.png)
- Look for "SQL Editor" in the left sidebar
- It's usually under the "Database" section

### Step 2: Create New Query
- Click the green "New query" button at the top
- A new tab will open with an empty SQL editor

### Step 3: Execute the Migration
- Paste the SQL code above
- Click "Run" or press Cmd+Enter (Mac) / Ctrl+Enter (Windows)

## Verification

After running the migration, verify it worked:

1. Go to "Table Editor" in the sidebar
2. Find the `business_context` table
3. Click on it and check the columns
4. You should see these new columns:
   - `business_description` (text)
   - `products_services` (jsonb)
   - `value_proposition` (text)
   - `business_model` (text)

## Alternative Method (Table Editor)

If you prefer a visual approach:

1. Go to "Table Editor" in sidebar
2. Find `business_context` table
3. Click the three dots menu (⋮) next to the table name
4. Select "Edit table"
5. Click "Add column" and manually add each column:
   - Name: `business_description`, Type: `text`
   - Name: `products_services`, Type: `jsonb`, Default: `[]`
   - Name: `value_proposition`, Type: `text`
   - Name: `business_model`, Type: `text`
6. Click "Save"

## What This Migration Does

This migration adds four new columns to store additional business information:
- **business_description**: A text description of your business
- **products_services**: A JSON array of your products/services
- **value_proposition**: Your unique value proposition
- **business_model**: Description of how your business operates

## Troubleshooting

If you get an error:
- **"permission denied"**: Make sure you're logged into the correct Supabase account
- **"relation does not exist"**: The business_context table might not exist yet
- **Column already exists**: The migration was already applied (this is fine!)

## After Migration

Once the migration is applied:
1. Refresh your EagleEye app
2. Go to Business Context page
3. You should now be able to fill in all the new fields
4. The auto-save feature will work properly

Need more help? Check the Supabase docs: https://supabase.com/docs/guides/database/migrations