-- Add avatar columns to 'couples' table

ALTER TABLE public.couples 
ADD COLUMN IF NOT EXISTS partner_1_avatar text,
ADD COLUMN IF NOT EXISTS partner_2_avatar text;
