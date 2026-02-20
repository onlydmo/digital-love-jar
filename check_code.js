
import { createClient } from '@supabase/supabase-js';

// Credentials from src/lib/supabase.js
const supabaseUrl = 'https://btgpocewlfarfkijpgax.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Z3BvY2V3bGZhcmZraWpwZ2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzEwNzksImV4cCI6MjA4NjMwNzA3OX0.X1OjXcZwXpHe95c2hR1uSULnD50BWO89aqfl5TemCXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCodes() {
    console.log('Checking codes in:', supabaseUrl);
    const { data, error } = await supabase
        .from('couples')
        .select('id, secret_code');

    if (error) {
        console.error('Error:', error);
    } else {
        if (data && data.length > 0) {
            console.log('CODES FOUND:', data);
        } else {
            console.log('NO CODES FOUND. The table is empty.');
        }
    }
}

checkCodes();
