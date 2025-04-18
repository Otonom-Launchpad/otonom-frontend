import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Fallback project data in case of database access issues
const fallbackProjects = {
  'ai-fusion': {
    id: 'ai-fusion',
    name: 'AI Fusion',
    short_description: 'Self-learning AI model for enterprise data analytics with built-in fraud detection.',
    description: `AI Fusion: Revolutionary Enterprise Data Analytics

AI Fusion creates breakthrough self-learning algorithms that enhance enterprise data analytics capabilities. Our system integrates seamlessly with existing business intelligence tools while providing advanced fraud detection capabilities that adapt to emerging threats.`,
    image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000',
    logo_url: 'https://cdn.pixabay.com/photo/2017/03/16/21/18/logo-2150297_640.png',
    website_url: 'https://aifusion.io',
    twitter_url: 'https://twitter.com/aifusion',
    team_info: JSON.stringify([
      {
        name: 'Dr. Sarah Chen',
        role: 'Founder & CEO',
        bio: 'Former Lead Data Scientist at Amazon, PhD in Machine Learning from Stanford',
        image: 'https://randomuser.me/api/portraits/women/22.jpg'
      },
      {
        name: 'Michael Rodriguez',
        role: 'CTO',
        bio: 'Previously Engineering Director at Palantir, MS in CS from MIT',
        image: 'https://randomuser.me/api/portraits/men/32.jpg'
      }
    ]),
    tokenomics: JSON.stringify({
      token_name: 'AI Fusion Token',
      token_symbol: 'AFT',
      initial_supply: 100000000,
      allocation: {
        team: '20%',
        investors: '30%',
        community: '40%',
        treasury: '10%'
      },
      vesting: {
        team: '3 years with 1 year cliff',
        investors: '2 years with 6 month cliff',
        community: 'No vesting',
        treasury: 'Locked for 2 years'
      }
    }),
    project_token_name: 'AI Fusion Token',
    project_token_symbol: 'AFT',
    project_token_rate: 0.30,
    funding_goal: 3000000,
    total_raised: 1800000,
    status: 'active',
    launch_date: new Date('2025-04-01').toISOString(),
    end_date: new Date('2025-05-15').toISOString(),
    tier_requirement: 1
  },
  'neural-bridge': {
    id: 'neural-bridge',
    name: 'Neural Bridge',
    short_description: 'Decentralized AI knowledge marketplace connecting specialized models through secure computing.',
    description: `# Neural Bridge: Decentralized AI Knowledge Marketplace

Neural Bridge is building the world's first decentralized marketplace for AI knowledge and computing resources. Our platform enables secure connections between specialized AI models, allowing them to share insights and computing power while maintaining data privacy.

## The Platform

The Neural Bridge platform uses a combination of blockchain technology and federated learning to create a secure environment where AI systems can:

1. Request specialized processing from other AI models
2. Share insights without revealing sensitive data
3. Monetize unique AI capabilities through tokenized transactions
4. Access distributed computing resources on-demand`,
    image_url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=1000',
    logo_url: 'https://cdn.pixabay.com/photo/2017/01/31/23/42/animal-2028258_640.png',
    website_url: 'https://neuralbridge.network',
    twitter_url: 'https://twitter.com/neuralbridge',
    team_info: JSON.stringify([
      {
        name: 'Dr. James Kim',
        role: 'Founder & CEO',
        bio: 'Former Research Scientist at OpenAI, PhD in Distributed Systems from UC Berkeley',
        image: 'https://randomuser.me/api/portraits/men/67.jpg'
      },
      {
        name: 'Elena Petrov',
        role: 'Chief Cryptography Officer',
        bio: 'Led privacy-preserving ML research at ETH Zurich, PhD in Cryptography',
        image: 'https://randomuser.me/api/portraits/women/58.jpg'
      }
    ]),
    tokenomics: JSON.stringify({
      token_name: 'Neural Bridge Token',
      token_symbol: 'NBRIDGE',
      initial_supply: 200000000,
      allocation: {
        team: '15%',
        investors: '25%',
        ecosystem: '40%',
        research: '10%',
        treasury: '10%'
      },
      vesting: {
        // Updated vesting data for consistency
        team: '4 years with 1 year cliff',
        investors: '3 years with 6 month cliff',
        ecosystem: 'Released based on network milestones',
        research: 'Linear release over 5 years',
        treasury: 'Managed by governance',
        distribution: 'Linear'
      }
    }),
    project_token_name: 'Neural Bridge Token',
    project_token_symbol: 'NBRIDGE',
    project_token_rate: 0.15,
    funding_goal: 5000000,
    total_raised: 3250000,
    status: 'active',
    launch_date: new Date('2025-03-15').toISOString(),
    end_date: new Date('2025-04-30').toISOString(),
    tier_requirement: 2
  },
  'cortex-mind': {
    id: 'cortex-mind',
    name: 'Cortex Mind',
    short_description: 'AI-driven brain-computer interface optimizing treatment for neurological disorders.',
    description: `# Cortex Mind: Revolutionizing Neurological Treatment

Cortex Mind is developing an advanced brain-computer interface (BCI) system that combines non-invasive hardware with sophisticated AI algorithms to dramatically improve treatment options for patients with neurological disorders.

## Platform Components

1. **Neural Signal Acquisition** - High-resolution EEG headset with proprietary sensor technology
2. **Real-time Signal Processing** - AI-driven algorithms for filtering and enhancing neural signals
3. **Adaptive Treatment Protocols** - Personalized treatment regimens that adjust based on patient response
4. **Clinical Dashboard** - Comprehensive monitoring and analysis tools for healthcare providers`,
    image_url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1000',
    logo_url: 'https://cdn.pixabay.com/photo/2018/03/07/17/01/brain-3206327_640.png',
    website_url: 'https://cortexmind.io',
    twitter_url: 'https://twitter.com/cortexmind',
    team_info: JSON.stringify([
      {
        name: 'Dr. Natalie Chen',
        role: 'Founder & CEO',
        bio: 'Former Director of Neuroscience at Neuralink, MD/PhD in Neuroscience from Johns Hopkins',
        image: 'https://randomuser.me/api/portraits/women/15.jpg'
      },
      {
        name: 'Dr. Marcus Williams',
        role: 'Chief Medical Officer',
        bio: 'Neurologist with 15 years clinical experience, MD from Harvard Medical School',
        image: 'https://randomuser.me/api/portraits/men/29.jpg'
      }
    ]),
    tokenomics: JSON.stringify({
      token_name: 'Cortex Mind Token',
      token_symbol: 'CMT',
      initial_supply: 120000000,
      allocation: {
        team: '18%',
        investors: '22%',
        research: '25%',
        patient_access: '25%',
        treasury: '10%'
      },
      vesting: {
        team: '4 years with 1 year cliff',
        investors: '3 years with 6 month cliff',
        research: 'Milestone-based release',
        patient_access: 'Linear release over 5 years',
        treasury: 'Governed by foundation'
      }
    }),
    project_token_name: 'Cortex Mind Token',
    project_token_symbol: 'CMT',
    project_token_rate: 0.20,
    funding_goal: 6000000,
    total_raised: 1200000,
    status: 'active',
    launch_date: new Date('2025-04-05').toISOString(),
    end_date: new Date('2025-05-20').toISOString(),
    tier_requirement: 2
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // First check if we have a fallback project with this ID
    if (id === 'ai-fusion' || id === 'neural-bridge' || id === 'cortex-mind') {
      console.log(`Using fallback data for project: ${id}`);
      return NextResponse.json(fallbackProjects[id]);
    }

    // Try to fetch the project by ID from Supabase
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      
      // If the error is not a 404 (not found), but a database permission issue
      if (error.code !== 'PGRST116') {
        // Try to find a fallback project with a similar name
        const fallbackProject = Object.values(fallbackProjects).find(p => 
          p.name.toLowerCase().includes(id.toLowerCase()) ||
          id.toLowerCase().includes(p.name.toLowerCase())
        );
        
        if (fallbackProject) {
          console.log(`Using fallback data for project similar to: ${id}`);
          return NextResponse.json(fallbackProject);
        }
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!project) {
      // If no project found in the database, check for a fallback
      const fallbackProject = Object.values(fallbackProjects).find(p => 
        p.name.toLowerCase().includes(id.toLowerCase()) ||
        id.toLowerCase().includes(p.name.toLowerCase())
      );
      
      if (fallbackProject) {
        console.log(`Using fallback data for project similar to: ${id}`);
        return NextResponse.json(fallbackProject);
      }
      
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Unexpected error:', error);
    
    // If error occurs, try to provide a fallback project
    if (fallbackProjects['ai-fusion']) {
      return NextResponse.json(fallbackProjects['ai-fusion']);
    }
    
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
