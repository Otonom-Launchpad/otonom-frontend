/**
 * Script to update project images in Supabase
 * Run with: npx ts-node scripts/update-project-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or key not found in environment variables');
  process.exit(1);
}

// Use service role key to bypass RLS policies
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Reliable image URLs
const projectImages = {
  'AI Fusion': 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8YWklMjByb2JvdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=80',
  'Neural Bridge': 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
  'Cortex Mind': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
};

async function updateProjectImages() {
  console.log('Starting project image updates...');

  try {
    // Get all projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name');

    if (error) {
      throw error;
    }

    console.log(`Found ${projects.length} projects to process`);

    // Update each project with appropriate image
    for (const project of projects) {
      if (projectImages[project.name]) {
        console.log(`Updating image for ${project.name}`);
        
        const { error: updateError } = await supabase
          .from('projects')
          .update({ image_url: projectImages[project.name] })
          .eq('id', project.id);

        if (updateError) {
          console.error(`Error updating ${project.name}:`, updateError);
        } else {
          console.log(`✅ Successfully updated ${project.name}`);
        }
      } else {
        console.log(`No image mapping for ${project.name}, skipping`);
      }
    }

    console.log('Project image update process complete');
  } catch (error) {
    console.error('Error updating project images:', error);
  }
}

updateProjectImages().catch(console.error);
