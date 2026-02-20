-- Add security columns to couples table
ALTER TABLE couples 
ADD COLUMN IF NOT EXISTS security_question TEXT,
ADD COLUMN IF NOT EXISTS security_answer TEXT;

-- Verify columns (optional, just to see output)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'couples';
