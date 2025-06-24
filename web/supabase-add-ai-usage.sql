-- Create AI usage tracking table
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bot_type TEXT CHECK (bot_type IN ('assistant', 'marketing', 'ads', 'design', 'accounting')) NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  request_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  -- Ensure one record per user per bot per day
  UNIQUE(user_id, bot_type, date)
);

-- Enable RLS
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own usage" ON ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON ai_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_ai_usage_user_bot_date ON ai_usage(user_id, bot_type, date);

-- Add updated_at trigger
CREATE TRIGGER update_ai_usage_updated_at BEFORE UPDATE ON ai_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to safely increment usage count
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_user_id UUID,
  p_bot_type TEXT,
  p_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Update and return the new count
  UPDATE ai_usage 
  SET request_count = request_count + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id 
    AND bot_type = p_bot_type 
    AND date = p_date
  RETURNING request_count INTO v_count;
  
  -- If no row was updated, insert a new one
  IF v_count IS NULL THEN
    INSERT INTO ai_usage (user_id, bot_type, date, request_count)
    VALUES (p_user_id, p_bot_type, p_date, 1)
    ON CONFLICT (user_id, bot_type, date) 
    DO UPDATE SET 
      request_count = ai_usage.request_count + 1,
      updated_at = NOW()
    RETURNING request_count INTO v_count;
  END IF;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;