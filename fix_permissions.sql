-- FIX: Disable strict Row Level Security (RLS) for the MVP
-- This allows the "Connect Partner" button to actually INSERT the new couple.

ALTER TABLE public.couples DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;

-- If you ran this file, you can now click "Connect Partner" and it should work!
