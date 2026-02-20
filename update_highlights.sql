-- Add 'is_highlight' column to 'notes' table

ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS is_highlight boolean default false;
