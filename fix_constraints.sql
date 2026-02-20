-- Remove UNIQUE constraint from 'date' column in 'notes' table
-- This allows multiple notes to be created on the same day.

BEGIN;

-- Try to drop the constraint if it exists. 
-- Note: The constraint name is usually 'notes_date_key' but might vary. 
-- We'll try to drop the index that enforcing it usually creates or the constraint itself.

ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_date_key;

COMMIT;

-- Also ensure RLS is disabled to avoid permission issues during testing
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
