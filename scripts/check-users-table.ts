import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase credentials in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsersTable() {
  try {
    // This will fetch the structure of the users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching user data:', error);
      return;
    }
    
    // If we got a user, log its structure
    if (data && data.length > 0) {
      console.log('User table columns:', Object.keys(data[0]));
      console.log('Sample user data:', data[0]);
    } else {
      console.log('No users found in the database');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkUsersTable()
  .catch(console.error)
  .finally(() => process.exit(0));
