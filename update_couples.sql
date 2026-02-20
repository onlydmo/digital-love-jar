-- Add Profile and Customization fields to 'couples' table

ALTER TABLE public.couples 
ADD COLUMN IF NOT EXISTS partner_1_name text,
ADD COLUMN IF NOT EXISTS partner_2_name text,
ADD COLUMN IF NOT EXISTS anniversary_date date,
ADD COLUMN IF NOT EXISTS theme text default 'classic',
ADD COLUMN IF NOT EXISTS ambience text default 'night';

-- We will skip avatar uploads for now to keep it simple, 
-- or just use text URLs if the user wants to paste them.
-- For "Profile Pictures: Upload avatars", we'd need storage buckets.
-- Let's stick to text inputs for names first as a MVP step.
