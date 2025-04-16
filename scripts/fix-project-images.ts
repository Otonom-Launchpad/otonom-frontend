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

// Updated project images with reliable sources
const projectUpdates = [
  {
    id: '1b4115dc-7280-4b90-8c23-0034fb05fdf1', // AI Fusion
    image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000',
    logo_url: 'https://cdn.pixabay.com/photo/2017/03/16/21/18/logo-2150297_640.png'
  },
  {
    id: 'f10c5123-0f73-48c6-be9d-ca2478051916', // Neural Bridge
    image_url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=1000',
    logo_url: 'https://cdn.pixabay.com/photo/2017/01/31/23/42/animal-2028258_640.png'
  },
  {
    id: '02d0b171-7268-4155-b79d-fea9b42d8a2b', // QuantumAI
    image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000',
    logo_url: 'https://cdn.pixabay.com/photo/2017/03/08/14/20/flat-2126879_640.png'
  },
  {
    id: 'aa9ef18d-1644-4af4-b1e8-f5f1d95eccf3', // Cortex Mind
    image_url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1000',
    logo_url: 'https://cdn.pixabay.com/photo/2018/03/07/17/01/brain-3206327_640.png'
  }
];

async function fixProjectImages() {
  try {
    console.log('Starting image updates...');
    
    for (const project of projectUpdates) {
      console.log(`Updating images for project ID: ${project.id}...`);
      
      const { data, error } = await supabase
        .from('projects')
        .update({
          image_url: project.image_url,
          logo_url: project.logo_url
        })
        .eq('id', project.id)
        .select();
      
      if (error) {
        console.error(`Error updating project ${project.id}:`, error);
      } else if (data && data.length > 0) {
        console.log(`✅ Successfully updated ${data[0].name}`);
      } else {
        console.log(`⚠️ No project found with ID: ${project.id}`);
      }
    }
    
    console.log('Image updates completed!');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

fixProjectImages()
  .catch(console.error)
  .finally(() => process.exit(0));
