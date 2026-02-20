-- Create 'couples' table
create table public.couples (
  id uuid default gen_random_uuid() primary key,
  secret_code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  partner_1_last_seen timestamp with time zone,
  partner_2_last_seen timestamp with time zone
);

-- Add fields to 'notes' table
alter table public.notes 
add column couple_id uuid references public.couples(id),
add column is_locked boolean default false,
add column lock_code text;

-- Add RLS policies (Optional but recommended)
alter table public.couples enable row level security;

create policy "Couples can view their own data"
on public.couples for select
using (secret_code = current_setting('app.current_couple_secret', true));
-- Note: For "Magic Link" simple auth without JWT, we might just keep RLS off or open for this prototype
-- For now, we will assume public access for simplicity as requested "simple and secure enough for love letters"
