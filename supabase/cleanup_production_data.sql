-- WARNING: THIS WILL PERMANENTLY DELETE ALL TEST DATA
-- Run this in your Supabase SQL Editor to start with a fresh, clean database.

-- 1. Delete all note memories
TRUNCATE TABLE notes CASCADE;

-- 2. Delete all couple memberships
TRUNCATE TABLE couple_members CASCADE;

-- 3. Delete all couple profiles
TRUNCATE TABLE couples CASCADE;


-- 4. (Optional) Reset any auto-increment IDs
-- No action needed if using UUIDs (which we are).

-- After running this, go back to your app and "Create New Space" for a clean production start.
