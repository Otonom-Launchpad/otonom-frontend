import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check Users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);
    
    if (usersError) {
      return NextResponse.json({ error: `Error fetching users: ${usersError.message}` }, { status: 500 });
    }
    
    // Check Projects table
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(3);
    
    if (projectsError) {
      return NextResponse.json({ error: `Error fetching projects: ${projectsError.message}` }, { status: 500 });
    }
    
    // Check Investments table
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('*')
      .limit(3);
    
    if (investmentsError) {
      return NextResponse.json({ error: `Error fetching investments: ${investmentsError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      users: {
        structure: users.length > 0 ? Object.keys(users[0]) : 'No records',
        sample: users
      },
      projects: {
        structure: projects.length > 0 ? Object.keys(projects[0]) : 'No records',
        sample: projects
      },
      investments: {
        structure: investments.length > 0 ? Object.keys(investments[0]) : 'No records',
        sample: investments
      }
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
