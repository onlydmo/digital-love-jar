-- Enable pgcrypto if not already enabled
create extension if not exists pgcrypto;

-- 1. Ensure columns exist
alter table notes add column if not exists lock_code_hash text;

-- 2. Create the Hashing Function
create or replace function hash_note_lock_code()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only hash if lock_code is provided and changed
  if NEW.lock_code is not null and (OLD.lock_code is null or NEW.lock_code != OLD.lock_code) then
    NEW.lock_code_hash := crypt(NEW.lock_code, gen_salt('bf'));
    -- Clear the plain text code
    NEW.lock_code := null; 
  end if;
  return NEW;
end;
$$;

-- 3. Create the Trigger
drop trigger if exists on_note_update_password on notes;
create trigger on_note_insert_password
before insert or update on notes
for each row execute function hash_note_lock_code();
