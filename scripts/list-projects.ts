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

async function listProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, image_url, logo_url')
      .order('name');
    
    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }
    
    console.log(`Found ${data.length} projects:`);
    data.forEach(project => {
      console.log(`- ${project.name} (ID: ${project.id})`);
      console.log(`  Image URL: ${project.image_url}`);
      console.log(`  Logo URL: ${project.logo_url}`);
      console.log();
    });
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

listProjects()
  .catch(console.error)
  .finally(() => process.exit(0));
