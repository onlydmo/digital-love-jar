import { supabase } from './src/lib/supabase.js';

async function testConnection() {
    const { data, error } = await supabase.from('notes').select('*');
    if (error) {
        console.error('Supabase Error:', error);
    } else {
        console.log('Supabase Connection Successful! Row count:', data.length);
        console.log('Sample Data:', data[0]);
    }
}

testConnection();
