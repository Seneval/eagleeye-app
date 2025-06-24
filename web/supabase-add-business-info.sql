-- Migration to add business information fields to business_context table

-- Add new columns to business_context table



-- Update the RLS policies if needed (they should already cover these new fields)
-- The existing policies use SELECT * and UPDATE *, so they'll automatically include new columns