import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample AI projects data
const projectsData = [
  {
    name: 'NeuraTrans',
    short_description: 'Real-time multilingual AI translation with contextual understanding and cultural nuance preservation.',
    description: `NeuraTrans is revolutionizing language translation with its breakthrough neural network architecture that preserves cultural context and nuances. Unlike conventional translation systems, NeuraTrans understands idioms, humor, and cultural references, delivering translations that feel natural to native speakers.

Our technology combines transformer-based language models with cultural knowledge graphs to provide translations that go beyond word-for-word conversion. The system continuously learns from feedback and can adapt to specialized domains like medicine, legal, or technical content.

Key applications include real-time conversation translation, document localization, and content adaptation for global audiences. We're targeting the $5.7B language services market with a solution that outperforms existing options by 37% in nuance preservation benchmarks.`,
    image_url: 'https://images.unsplash.com/photo-1546962339-5ff89552b8ed?q=80&w=1000',
    logo_url: 'https://via.placeholder.com/150?text=NeuraTrans',
    website_url: 'https://neuratrans.ai',
    twitter_url: 'https://twitter.com/neuratrans',
    team_info: JSON.stringify([
      {
        name: 'Dr. Maya Chen',
        role: 'Founder & CEO',
        bio: 'Former Lead Researcher at DeepMind, PhD in Computational Linguistics from Stanford',
        image: 'https://randomuser.me/api/portraits/women/41.jpg'
      },
      {
        name: 'Raj Patel',
        role: 'CTO',
        bio: 'Previously VP of Engineering at Duolingo, MS in CS from Carnegie Mellon',
        image: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      {
        name: 'Sophia Torres',
        role: 'Chief Linguist',
        bio: 'Polyglot fluent in 8 languages, PhD in Cognitive Science from MIT',
        image: 'https://randomuser.me/api/portraits/women/68.jpg'
      }
    ]),
    tokenomics: JSON.stringify({
      token_name: 'NeuraTrans Token',
      token_symbol: 'NTT',
      initial_supply: 100000000,
      allocation: {
        team: '20%',
        investors: '30%',
        community: '40%',
        liquidity: '10%'
      },
      vesting: {
        team: '3 years with 1 year cliff',
        investors: '2 years with 6 month cliff',
        community: 'No vesting',
        liquidity: 'Locked for 2 years'
      }
    }),
    project_token_name: 'NeuraTrans Token',
    project_token_symbol: 'NTT',
    project_token_rate: 0.25,
    funding_goal: 2500000,
    total_raised: 1250000,
    status: 'active',
    launch_date: new Date('2025-04-01').toISOString(),
    end_date: new Date('2025-05-15').toISOString(),
    tier_requirement: 1
  },
  {
    name: 'SentiGuard',
    short_description: 'Emotion AI security system that detects potential threats through behavioral and sentiment analysis.',
    description: `SentiGuard leverages cutting-edge emotion recognition AI to transform security protocols across physical and digital spaces. Our technology analyzes micro-expressions, vocal tonality, gait patterns, and behavioral anomalies to identify potential security threats before they materialize.

The system integrates with existing security infrastructure to provide an additional layer of threat detection that goes beyond traditional methods. SentiGuard can identify emotional states that correlate with harmful intent while maintaining privacy through edge computing and anonymized processing.

Our AI has been trained on diverse global datasets to minimize bias and ensure fair treatment across demographics. Initial deployments in transportation hubs have demonstrated a 62% improvement in early threat detection compared to traditional security systems alone.`,
    image_url: 'https://images.unsplash.com/photo-1563656573-88628144198c?q=80&w=1000',
    logo_url: 'https://via.placeholder.com/150?text=SentiGuard',
    website_url: 'https://sentiguard.io',
    twitter_url: 'https://twitter.com/sentiguard',
    team_info: JSON.stringify([
      {
        name: 'Isaac Reynolds',
        role: 'Founder & CEO',
        bio: 'Former Intelligence Officer, PhD in Security Studies from Georgetown',
        image: 'https://randomuser.me/api/portraits/men/41.jpg'
      },
      {
        name: 'Dr. Amina Ibrahim',
        role: 'Chief AI Officer',
        bio: 'Led emotion recognition research at MIT Media Lab, PhD in Computer Vision',
        image: 'https://randomuser.me/api/portraits/women/33.jpg'
      },
      {
        name: 'Thomas Wright',
        role: 'COO',
        bio: 'Former Global Security Director at Marriott International, MBA from Wharton',
        image: 'https://randomuser.me/api/portraits/men/55.jpg'
      }
    ]),
    tokenomics: JSON.stringify({
      token_name: 'SentiGuard Token',
      token_symbol: 'SGT',
      initial_supply: 50000000,
      allocation: {
        team: '15%',
        investors: '35%',
        community: '30%',
        security_network: '20%'
      },
      vesting: {
        team: '4 years with 1 year cliff',
        investors: '2 years with 6 month cliff',
        community: 'Gradual release over 3 years',
        security_network: 'Released as network grows'
      }
    }),
    project_token_name: 'SentiGuard Token',
    project_token_symbol: 'SGT',
    project_token_rate: 0.5,
    funding_goal: 3000000,
    total_raised: 750000,
    status: 'active',
    launch_date: new Date('2025-04-10').toISOString(),
    end_date: new Date('2025-05-20').toISOString(),
    tier_requirement: 2
  },
  {
    name: 'ChainMinds',
    short_description: 'Decentralized infrastructure for collective AI training and intelligence sharing with built-in tokenized rewards.',
    description: `ChainMinds is building the first truly decentralized collective intelligence network where AI systems learn and evolve through secure, blockchain-verified knowledge sharing. Our platform allows multiple AI models to collaborate on complex problems while maintaining data privacy and security.

Our breakthrough lies in the creation of a tokenized intelligence economy where AI improvements are incentivized and knowledge contributions are rewarded. Organizations and individuals can contribute data, computational resources, or model improvements and receive $MINDS tokens based on the value added to the network.

The ChainMinds protocol includes built-in verification systems that ensure data quality and prevent poisoning attacks. Initial use cases include collaborative medical research, climate modeling, and financial risk assessment where pooling intelligence across organizations dramatically improves outcomes.`,
    image_url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000',
    logo_url: 'https://via.placeholder.com/150?text=ChainMinds',
    website_url: 'https://chainminds.network',
    twitter_url: 'https://twitter.com/chainminds',
    team_info: JSON.stringify([
      {
        name: 'Dr. Alan Zhang',
        role: 'Founder & CEO',
        bio: 'Former Lead Architect at Filecoin, PhD in Distributed Systems from ETH Zurich',
        image: 'https://randomuser.me/api/portraits/men/29.jpg'
      },
      {
        name: 'Elena Petrova',
        role: 'Chief Cryptography Officer',
        bio: 'Cryptography researcher with contributions to zero-knowledge proofs, PhD from University of Waterloo',
        image: 'https://randomuser.me/api/portraits/women/28.jpg'
      },
      {
        name: 'Marcus Johnson',
        role: 'Chief AI Scientist',
        bio: 'Previously led research on federated learning at Google Brain, PhD from Berkeley',
        image: 'https://randomuser.me/api/portraits/men/36.jpg'
      }
    ]),
    tokenomics: JSON.stringify({
      token_name: 'ChainMinds Token',
      token_symbol: 'MINDS',
      initial_supply: 200000000,
      allocation: {
        team: '15%',
        investors: '20%',
        ecosystem_growth: '45%',
        network_rewards: '20%'
      },
      vesting: {
        team: '4 years with 1 year cliff',
        investors: '3 years with 6 month cliff',
        ecosystem_growth: 'Released based on network milestones',
        network_rewards: 'Continuous emission based on participation'
      }
    }),
    project_token_name: 'ChainMinds Token',
    project_token_symbol: 'MINDS',
    project_token_rate: 0.10,
    funding_goal: 5000000,
    total_raised: 2300000,
    status: 'active',
    launch_date: new Date('2025-03-15').toISOString(),
    end_date: new Date('2025-04-30').toISOString(),
    tier_requirement: 3
  },
  {
    name: 'BioSynthAI',
    short_description: 'AI-powered drug discovery platform specializing in novel antibiotics against treatment-resistant infections.',
    description: `BioSynthAI is accelerating the discovery of life-saving antibiotics using a revolutionary AI platform that can identify novel compounds effective against drug-resistant bacteria. Our system combines generative chemistry, reinforcement learning, and advanced molecular simulation to design compounds that traditional methods have missed.

The platform's unique capability lies in its ability to optimize drug candidates for efficacy, safety, and manufacturability simultaneously, dramatically reducing the time from discovery to clinical trials. BioSynthAI has already discovered two promising antibiotic candidates currently in preclinical testing that show effectiveness against bacteria resistant to all current antibiotics.

Our business model combines internal drug development with partnership opportunities for pharmaceutical companies. The $42B antibiotics market faces a critical innovation gap as resistance increases, positioning BioSynthAI as a crucial player in addressing this global health challenge.`,
    image_url: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?q=80&w=1000',
    logo_url: 'https://via.placeholder.com/150?text=BioSynthAI',
    website_url: 'https://biosynthai.com',
    twitter_url: 'https://twitter.com/biosynthai',
    team_info: JSON.stringify([
      {
        name: 'Dr. Olivia Parker',
        role: 'Founder & CEO',
        bio: 'Former Director of Research at Merck, PhD in Computational Biology from Cambridge',
        image: 'https://randomuser.me/api/portraits/women/23.jpg'
      },
      {
        name: 'Dr. James Lee',
        role: 'Chief Science Officer',
        bio: 'Microbiologist specializing in antibiotic resistance, previous NIH grant recipient, PhD from Johns Hopkins',
        image: 'https://randomuser.me/api/portraits/men/22.jpg'
      },
      {
        name: 'Dr. Sarah Nguyen',
        role: 'Head of AI',
        bio: 'Led molecular generation ML research at Recursion Pharmaceuticals, PhD from Caltech',
        image: 'https://randomuser.me/api/portraits/women/45.jpg'
      }
    ]),
    tokenomics: JSON.stringify({
      token_name: 'BioSynthAI Token',
      token_symbol: 'BSAI',
      initial_supply: 80000000,
      allocation: {
        team: '20%',
        investors: '30%',
        research_partners: '25%',
        treasury: '25%'
      },
      vesting: {
        team: '3 years with 1 year cliff',
        investors: '2 years with 3 month cliff',
        research_partners: 'Released based on research milestones',
        treasury: 'Managed by governance'
      }
    }),
    project_token_name: 'BioSynthAI Token',
    project_token_symbol: 'BSAI',
    project_token_rate: 0.75,
    funding_goal: 4000000,
    total_raised: 0,
    status: 'upcoming',
    launch_date: new Date('2025-05-01').toISOString(),
    end_date: new Date('2025-06-15').toISOString(),
    tier_requirement: 2
  }
];

async function seedProjects() {
  // Clear existing projects first
  const { error: deleteError } = await supabase
    .from('projects')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all rows

  if (deleteError) {
    console.error('Error deleting existing projects:', deleteError);
    return;
  }

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
}

seedProjects()
  .catch(console.error)
  .finally(() => process.exit(0));
