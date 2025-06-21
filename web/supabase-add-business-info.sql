-- Migration to add business information fields to business_context table

-- Add new columns to business_context table
ALTER TABLE business_context 
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS products_services JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS value_proposition TEXT,
ADD COLUMN IF NOT EXISTS business_model TEXT;

-- Update the RLS policies if needed (they should already cover these new fields)
-- The existing policies use SELECT * and UPDATE *, so they'll automatically include new columns