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

// Sample AI projects based on the previously displayed featured projects
const projectsData = [
  {
    name: 'AI Fusion',
    short_description: 'Self-learning AI model for enterprise data analytics with built-in fraud detection.',
    description: `# AI Fusion: Revolutionary Enterprise Data Analytics

AI Fusion creates breakthrough self-learning algorithms that enhance enterprise data analytics capabilities. Our system integrates seamlessly with existing business intelligence tools while providing advanced fraud detection capabilities that adapt to emerging threats.

## Key Features

- Real-time anomaly detection with 99.7% accuracy
- Seamless integration with existing BI tools
- Self-optimizing algorithms requiring minimal human oversight
- Data privacy preservation through federated learning
- Custom alert systems for different threat levels

## Market Opportunity

The data analytics market is projected to reach $132.9 billion by 2026, with fraud detection solutions representing a $38.2 billion segment. AI Fusion addresses both markets with an integrated solution that outperforms standalone alternatives.

## Competitive Advantage

Unlike traditional solutions that require constant rule updates, AI Fusion continuously learns from new data patterns, reducing false positives by 78% compared to rule-based systems. Our patented neural architecture maintains high accuracy even with limited training data.`,
    image_url: 'https://images.unsplash.com/photo-1639322537175-6a291fcd89ff?q=80&w=1000',
    logo_url: 'https://via.placeholder.com/150?text=AI+Fusion',
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
      },
      {
        name: 'Aisha Johnson',
        role: 'Chief Data Officer',
        bio: 'Former Analytics Lead at JPMorgan Chase, PhD in Statistics from Columbia',
        image: 'https://randomuser.me/api/portraits/women/28.jpg'
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
  {
    name: 'Neural Bridge',
    short_description: 'Decentralized AI knowledge marketplace connecting specialized models through secure computing.',
    description: `# Neural Bridge: Decentralized AI Knowledge Marketplace

Neural Bridge is building the world's first decentralized marketplace for AI knowledge and computing resources. Our platform enables secure connections between specialized AI models, allowing them to share insights and computing power while maintaining data privacy.

## The Platform

The Neural Bridge platform uses a combination of blockchain technology and federated learning to create a secure environment where AI systems can:

1. Request specialized processing from other AI models
2. Share insights without revealing sensitive data
3. Monetize unique AI capabilities through tokenized transactions
4. Access distributed computing resources on-demand

## Technical Innovation

Our breakthrough secure multi-party computation protocol enables AI models to learn from each other without exposing their training data or model weights. This addresses the core challenge of creating collaborative AI ecosystems while maintaining competitive advantages and data privacy.

## Token Ecosystem

The $NBRIDGE token powers all platform transactions, creating a self-sustaining economy where:

- AI providers earn tokens by fulfilling computational requests
- Consumers spend tokens to access specialized AI capabilities
- Validators earn tokens for maintaining network security
- Token holders participate in governance decisions`,
    image_url: 'https://images.unsplash.com/photo-1647427060118-4911c9821b82?q=80&w=1000',
    logo_url: 'https://via.placeholder.com/150?text=Neural+Bridge',
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
      },
      {
        name: 'David Washington',
        role: 'Chief Product Officer',
        bio: 'Previously Product Lead at Chainlink, MBA from Harvard Business School',
        image: 'https://randomuser.me/api/portraits/men/42.jpg'
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
        team: '4 years with 1 year cliff',
        investors: '3 years with 6 month cliff',
        ecosystem: 'Released based on network milestones',
        research: 'Linear release over 5 years',
        treasury: 'Managed by governance'
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
  {
    name: 'QuantumAI',
    short_description: 'Quantum computing-enhanced deep learning platform for complex molecular simulations.',
    description: `# QuantumAI: Quantum-Enhanced Deep Learning

QuantumAI is pioneering the intersection of quantum computing and artificial intelligence to solve previously intractable problems in molecular simulation and drug discovery. Our hybrid classical-quantum architecture dramatically accelerates complex simulations while maintaining high accuracy.

## Core Technology

QuantumAI's platform combines:

1. **Quantum Circuit Learning (QCL)** - Novel algorithms that exploit quantum properties for enhanced deep learning
2. **Quantum-Classical Neural Networks** - A hybrid architecture that optimizes which computations run on quantum vs. classical hardware
3. **Molecular Simulation Framework** - Specialized tools for pharmaceutical and materials science applications

## Applications

Initial applications focus on:

- **Drug Discovery** - Reducing lead compound identification time from years to months
- **Materials Science** - Discovering novel materials with specific electrical, thermal, or mechanical properties
- **Protein Folding** - Accurately predicting protein structures from amino acid sequences

## Business Model

QuantumAI operates as both a SaaS platform and research partner:

- Annual subscription model for access to simulation platform
- Research collaboration agreements with pharmaceutical and materials companies
- Custom solution development for specialized applications`,
    image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000',
    logo_url: 'https://via.placeholder.com/150?text=QuantumAI',
    website_url: 'https://quantumai.tech',
    twitter_url: 'https://twitter.com/quantumai_tech',
    team_info: JSON.stringify([
      {
        name: 'Dr. Robert Zhao',
        role: 'Founder & CEO',
        bio: 'Former Quantum Physicist at IBM Research, PhD in Quantum Information from MIT',
        image: 'https://randomuser.me/api/portraits/men/52.jpg'
      },
      {
        name: 'Dr. Leila Patel',
        role: 'Chief Science Officer',
        bio: 'Led quantum algorithm development at D-Wave, PhD in Quantum Chemistry from Caltech',
        image: 'https://randomuser.me/api/portraits/women/31.jpg'
      },
      {
        name: 'Thomas Weber',
        role: 'VP of Engineering',
        bio: 'Previously Senior Quantum Engineer at Rigetti Computing, MS in Physics from Stanford',
        image: 'https://randomuser.me/api/portraits/men/18.jpg'
      }
    ]),
    tokenomics: JSON.stringify({
      token_name: 'QuantumAI Token',
      token_symbol: 'QAI',
      initial_supply: 80000000,
      allocation: {
        team: '20%',
        investors: '25%',
        research: '15%',
        community: '30%',
        treasury: '10%'
      },
      vesting: {
        team: '3 years with 1 year cliff',
        investors: '2 years with 3 month cliff',
        research: 'Allocated based on research milestones',
        community: 'Released over 2 years',
        treasury: 'Managed by foundation'
      }
    }),
    project_token_name: 'QuantumAI Token',
    project_token_symbol: 'QAI',
    project_token_rate: 0.45,
    funding_goal: 4500000,
    total_raised: 2700000,
    status: 'active',
    launch_date: new Date('2025-03-01').toISOString(),
    end_date: new Date('2025-04-15').toISOString(),
    tier_requirement: 3
  },
  {
    name: 'Cortex Mind',
    short_description: 'AI-driven brain-computer interface optimizing treatment for neurological disorders.',
    description: `# Cortex Mind: Revolutionizing Neurological Treatment

Cortex Mind is developing an advanced brain-computer interface (BCI) system that combines non-invasive hardware with sophisticated AI algorithms to dramatically improve treatment options for patients with neurological disorders.

## Platform Components

1. **Neural Signal Acquisition** - High-resolution EEG headset with proprietary sensor technology
2. **Real-time Signal Processing** - AI-driven algorithms for filtering and enhancing neural signals
3. **Adaptive Treatment Protocols** - Personalized treatment regimens that adjust based on patient response
4. **Clinical Dashboard** - Comprehensive monitoring and analysis tools for healthcare providers

## Initial Applications

- **Epilepsy Management** - Early detection of seizure patterns with 94% accuracy
- **Stroke Rehabilitation** - Personalized therapy regimens that adapt to recovery progress
- **ADHD Treatment** - Non-pharmaceutical intervention options with measurable outcomes
- **Anxiety & Depression** - Neural feedback techniques for mood regulation

## Clinical Validation

Our technology has undergone three clinical trials demonstrating:
- 68% reduction in epileptic seizure frequency
- 41% improvement in post-stroke motor recovery metrics
- 53% of ADHD patients showing clinically significant improvement

## Regulatory Pathway

Cortex Mind is pursuing FDA clearance through the De Novo pathway with breakthrough device designation.`,
    image_url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1000',
    logo_url: 'https://via.placeholder.com/150?text=Cortex+Mind',
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
      },
      {
        name: 'Dr. Akira Tanaka',
        role: 'Head of AI',
        bio: 'Specialized in neural signal processing, PhD from University of Tokyo',
        image: 'https://randomuser.me/api/portraits/men/64.jpg'
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
];

async function seedProjects() {
  try {
    // Clear existing projects if needed
    // Uncomment the following if you want to delete all existing projects first
    // const { error: deleteError } = await supabase
    //   .from('projects')
    //   .delete()
    //   .neq('id', '00000000-0000-0000-0000-000000000000');
    // 
    // if (deleteError) {
    //   console.error('Error deleting existing projects:', deleteError);
    //   return;
    // }

    // Insert new projects
    const { data, error } = await supabase
      .from('projects')
      .insert(projectsData)
      .select();

    if (error) {
      console.error('Error inserting projects:', error);
      return;
    }

    console.log(`Successfully seeded ${data.length} projects:`, data.map(p => p.name).join(', '));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

seedProjects()
  .catch(console.error)
  .finally(() => process.exit(0));
