import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btgpocewlfarfkijpgax.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Z3BvY2V3bGZhcmZraWpwZ2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzEwNzksImV4cCI6MjA4NjMwNzA3OX0.X1OjXcZwXpHe95c2hR1uSULnD50BWO89aqfl5TemCXY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
