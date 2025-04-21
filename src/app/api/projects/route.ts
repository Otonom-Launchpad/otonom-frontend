import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Sample fallback data in case of database access issues
const fallbackProjects = [
  {
    id: 'ai-fusion',
    name: 'AI Fusion',
    short_description: 'Self-learning AI model for enterprise data analytics with built-in fraud detection.',
    // Fixed image URL with proper extension and parameters
    image_url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8YWklMjByb2JvdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=80',
    logo_url: 'https://cdn.pixabay.com/photo/2017/03/16/21/18/logo-2150297_640.png',
    project_token_symbol: 'AFT',
    project_token_rate: 0.30,
    funding_goal: 3000000,
    total_raised: 1800000,
    status: 'active',
    tier_requirement: 1,
    end_date: new Date('2025-05-15').toISOString(),
  },
  {
    id: 'neural-bridge',
    name: 'Neural Bridge',
    short_description: 'Decentralized AI knowledge marketplace connecting specialized models through secure computing.',
    image_url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=1000',
    logo_url: 'https://cdn.pixabay.com/photo/2017/01/31/23/42/animal-2028258_640.png',
    project_token_symbol: 'NBRIDGE',
    project_token_rate: 0.15,
    funding_goal: 5000000,
    total_raised: 3250000,
    status: 'active',
    tier_requirement: 2,
    end_date: new Date('2025-04-30').toISOString(),
  },
  {
    id: 'cortex-mind',
    name: 'Cortex Mind',
    short_description: 'AI-driven brain-computer interface optimizing treatment for neurological disorders.',
    image_url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1000',
    logo_url: 'https://cdn.pixabay.com/photo/2018/03/07/17/01/brain-3206327_640.png',
    project_token_symbol: 'CMT',
    project_token_rate: 0.20,
    funding_goal: 6000000,
    total_raised: 1200000,
    status: 'active',
    tier_requirement: 2,
    end_date: new Date('2025-05-20').toISOString(),
  },
];

export async function GET() {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*');

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(fallbackProjects, { status: 200 });
    }

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(fallbackProjects, { status: 200 });
  }
}
