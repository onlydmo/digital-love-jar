-- Add ambience column to couples table
ALTER TABLE couples
ADD COLUMN IF NOT EXISTS ambience TEXT DEFAULT 'night';

-- Update existing rows to have a default value if currently null
UPDATE couples
SET ambience = 'night'
WHERE ambience IS NULL;
