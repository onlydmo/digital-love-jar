-- Enable cryptographic functions
create extension if not exists pgcrypto;

-- 1. Couples Table (Enhanced)
-- We keep 'secret_code' for now if migration is manual, but 'secret_code_hash' is the target.
alter table couples add column if not exists secret_code_hash text;
-- Note: In a real migration, we would hash existing codes and drop the plain text column.
-- update couples set secret_code_hash = crypt(secret_code, gen_salt('bf'));

-- 2. Notes Table (Enhanced)
alter table notes add column if not exists lock_code_hash text;

-- 3. Couple Members (Link Table for Anonymous Auth)
create table if not exists couple_members (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  user_id uuid default auth.uid() not null, -- Links to Supabase Auth User
  created_at timestamptz default now(),
  unique(couple_id, user_id)
);

-- 4. Enable Row Level Security
alter table couples enable row level security;
alter table notes enable row level security;
alter table couple_members enable row level security;

-- 5. RLS Policies

-- Couple Members: Users can see their own membership
create policy "Users can view own membership" 
on couple_members for select 
using (auth.uid() = user_id);

-- Couples: Users can view their own couple data
create policy "Users can view own couple" 
on couples for select 
using (
  id in (select couple_id from couple_members where user_id = auth.uid())
);

create policy "Users can update own couple" 
on couples for update 
using (
  id in (select couple_id from couple_members where user_id = auth.uid())
);

-- Notes: Users can view/create notes for their couple
create policy "Users can view couple notes" 
on notes for select 
using (
  couple_id in (select couple_id from couple_members where user_id = auth.uid())
);

create policy "Users can create notes for couple" 
on notes for insert 
with check (
  couple_id in (select couple_id from couple_members where user_id = auth.uid())
);

create policy "Users can update couple notes" 
on notes for update 
using (
  couple_id in (select couple_id from couple_members where user_id = auth.uid())
);

-- 6. RPC Functions for Secure Logic

-- Join/Login Function
-- call this after supabase.auth.signInAnonymously()
create or replace function join_couple(secret_code_input text)
returns jsonb
language plpgsql
security definer
as $$
declare
  target_couple_id uuid;
  target_couple record;
begin
  -- 1. Find couple by matching hash (or plain text if during migration)
  -- For this example, we assume we compare against the plain text 'secret_code' 
  -- OR the hash if you fully migrated.
  -- Let's support the legacy plain text for now to avoid breaking your current data immediately,
  -- but ideally you switch to: where secret_code_hash = crypt(secret_code_input, secret_code_hash)
  
  select * into target_couple 
  from couples 
  where secret_code = secret_code_input 
  limit 1;

  if target_couple.id is null then
    return '{"success": false, "message": "Invalid code"}'::jsonb;
  end if;

  -- 2. Link current user to couple
  insert into couple_members (couple_id, user_id)
  values (target_couple.id, auth.uid())
  on conflict (couple_id, user_id) do nothing;

  return jsonb_build_object('success', true, 'couple', row_to_json(target_couple));
end;
$$;

-- Create New Couple Function
create or replace function create_new_couple(secret_code_input text)
returns jsonb
language plpgsql
security definer
as $$
declare
  new_couple_id uuid;
  new_couple record;
begin
  -- 1. Create Couple
  insert into couples (secret_code)
  values (secret_code_input)
  returning * into new_couple;

  -- 2. Link Creator
  insert into couple_members (couple_id, user_id)
  values (new_couple.id, auth.uid());

  return jsonb_build_object('success', true, 'couple', row_to_json(new_couple));
end;
$$;
