'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { parseMarkdown } from "@/lib/markdown-utils";
import { notFound } from 'next/navigation';
import { InvestButton } from '@/components/projects/invest-button';

// Custom Progress component since the standard one is missing
const Progress = ({ value = 0, className = '', indicatorClassName = '' }) => {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full ${className}`}>
      <div 
        className={`h-full w-full flex-1 transition-all ${indicatorClassName || 'bg-primary'}`}
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </div>
  );
};

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

interface Tokenomics {
  token_name: string;
  token_symbol: string;
  initial_supply: number;
  allocation: {
    team: string;
    investors: string;
    community: string;
    [key: string]: string;
  };
  vesting: {
    team: string;
    investors: string;
    community: string;
    [key: string]: string;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  short_description: string;
  image_url: string;
  logo_url: string;
  website_url: string;
  twitter_url: string;
  team_info: string;
  tokenomics: string;
  project_token_name: string;
  project_token_symbol: string;
  project_token_rate: number;
  funding_goal: number;
  total_raised: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  launch_date: string;
  end_date: string;
  tier_requirement: number;
  created_at: string;
  updated_at: string;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'tokenomics'>('overview');
  const [investmentAmount, setInvestmentAmount] = useState<string>('0');

  // Version 2.0 - Force refresh of vesting tables
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        // Added cache-busting parameter
        const response = await fetch(`/api/projects/${params.id}?v=2.0`);
        
        if (!response.ok) {
          throw new Error(`Error fetching project: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Force parse tokenomics to ensure fresh data
        if (data.tokenomics && typeof data.tokenomics === 'string') {
          try {
            const parsed = JSON.parse(data.tokenomics);
            // Re-stringify to ensure fresh object
            data.tokenomics = JSON.stringify(parsed);
          } catch (e) {
            console.warn('Failed to re-parse tokenomics:', e);
          }
        }
        
        if (!data || data.error === 'Project not found') {
          notFound();
          return;
        }
        
        setProject(data);
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setError((err as Error).message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  // Handle changes to the investment amount input
  const handleInvestmentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters and leading zeros
    const cleanValue = e.target.value.replace(/[^0-9]/g, '');
    
    // Enforce min/max limits for hackathon
    if (cleanValue !== '') {
      const numValue = parseInt(cleanValue, 10);
      if (numValue > 100000) {
        // Cap at 100,000 (maximum OFUND tokens available per user)
        setInvestmentAmount('100000');
        return;
      }
    }
    
    // Set the cleaned value
    setInvestmentAmount(cleanValue === '' ? '0' : cleanValue);
    
    // Print debugging info
    console.log(`Investment amount updated: $${cleanValue}`);
    console.log(`Token amount at current price: ${parseFloat(cleanValue || '0') / (project?.project_token_rate || 1)} ${project?.project_token_symbol}`);
  };

  const calculateTokenAmount = () => {
    if (!project || !investmentAmount || investmentAmount === '0') return 0;
    
    return parseFloat(investmentAmount) / project.project_token_rate;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Process description to remove Key Features section to avoid duplication
  const processDescription = (description: string) => {
    if (!description) return '';
    
    // Remove the Key Features section and everything after it until the next heading
    // This prevents duplicate content when we manually add Key Features section
    const keyFeaturesIndex = description.indexOf('## Key Features');
    if (keyFeaturesIndex !== -1) {
      // Find the next heading after Key Features or return just the content before Key Features
      const nextHeadingIndex = description.indexOf('#', keyFeaturesIndex + 1);
      if (nextHeadingIndex !== -1) {
        return description.substring(0, keyFeaturesIndex) + description.substring(nextHeadingIndex);
      } else {
        return description.substring(0, keyFeaturesIndex);
      }
    }
    
    return description;
  };

  // Parse team info and tokenomics from JSON strings
  const teamMembers: TeamMember[] = project?.team_info ? JSON.parse(project.team_info) : [];
  const tokenomics: Tokenomics = project?.tokenomics ? JSON.parse(project.tokenomics) : { 
    token_name: '', 
    token_symbol: '', 
    initial_supply: 0,
    allocation: { team: '15%', investors: '20%', community: '25%', ecosystem: '15%', marketing: '10%', reserve: '15%' },
    vesting: { team: '', investors: '', community: '' }
  };

  // Parse percentage values for display
  const parsePercentage = (value: string): string => {
    // If it's already a percentage with % sign
    if (value.includes('%')) {
      return value;
    }
    // If it's a decimal (e.g., 0.15)
    if (value.includes('.')) {
      return `${parseFloat(value) * 100}%`;
    }
    // If it's a number without % sign
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      return `${num}%`;
    }
    // Default fallback
    return '0%';
  };

  // Calculate funding progress percentage
  const fundingProgress = project ? (project.total_raised / project.funding_goal) * 100 : 0;

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-pulse h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="animate-pulse h-64 bg-gray-200 rounded mb-6"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !project) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 font-heading">Error Loading Project</h1>
            <p className="text-gray-600 mb-8">{error || 'Project not found'}</p>
            <Link href="/projects">
              <Button className="bg-black hover:bg-black/80 text-white rounded-[100px] py-3 h-auto font-medium">Browse All Projects</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero section with project image and gradient overlay */}
      <div className="relative h-auto min-h-[650px] md:h-[650px] bg-black mt-20 pb-10 md:pb-0">
        {project.image_url && (
          <div className="absolute inset-0">
            <Image 
              src={project.image_url} 
              alt={project.name}
              fill
              className="object-cover opacity-80"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
          </div>
        )}
        
        <div className="container relative z-10 mx-auto px-4 h-full flex items-center">
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 py-0 pt-16 md:pt-0">
            {/* Project info aligned left */}
            <div className="text-white md:col-span-8 flex flex-col justify-center mt-0 md:mt-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[#9d00ff] px-2.5 py-0.5 text-xs font-medium">
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold font-heading tracking-tight">{project.name}</h1>
              <p className="mt-5 text-xl md:text-2xl font-semibold text-[#D4DFE8] max-w-3xl font-heading">{project.short_description}</p>
              
              <div className="flex flex-wrap gap-6 mt-6">
                {project.website_url && (
                  <a 
                    href={project.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white hover:text-[#9d00ff] transition-colors font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    Website
                  </a>
                )}
                
                <a 
                  href="https://www.linkedin.com/company/cortex-mind" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white hover:text-[#9d00ff] transition-colors font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Investment card in hero section */}
            <div className="bg-[#1a1a24] rounded-xl border border-gray-800 p-6 md:col-span-4">
              <h3 className="text-xl font-semibold mb-4 mt-2 text-white font-heading">Make an Investment</h3>
              
              <div className="mt-6 mb-8 bg-black/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400">Your Investment</span>
                  <div className="relative w-1/2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      id="investment-amount"
                      value={investmentAmount}
                      onChange={handleInvestmentAmountChange}
                      onFocus={(e) => {
                        e.target.placeholder = '';
                        // If the value is 0, clear it on focus
                        if (investmentAmount === '0') {
                          setInvestmentAmount('');
                        }
                      }}
                      onBlur={(e) => {
                        e.target.placeholder = '0';
                        // If empty, reset to 0
                        if (investmentAmount === '') {
                          setInvestmentAmount('0');
                        }
                      }}
                      className="w-full pl-7 pr-3 py-2 bg-transparent border-2 border-gray-500 rounded-md focus:outline-none focus:border-[#9d00ff] text-white text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="0"
                      step="100"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400">You will receive:</span>
                  <span className="text-white font-medium">
                    {calculateTokenAmount().toLocaleString()} {project.project_token_symbol}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Token price:</span>
                  <span className="text-gray-400">${project.project_token_rate} USD</span>
                </div>
              </div>
              
              <div className="mb-10 mt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#9d00ff]"></div>
                  <span className="text-white">Project Status: <span 
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#9d00ff33',
                      color: '#9d00ff',
                      borderRadius: '9999px',
                      padding: '4px 12px',
                      marginLeft: '4px',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      textTransform: 'capitalize'
                    }}
                  >{project.status}</span></span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#9d00ff]"></div>
                  <span className="text-white">Sale Ends: <span className="bg-[#9d00ff]/10 text-[#9d00ff] font-medium px-2 py-0.5 rounded-full text-sm">{formatDate(project.end_date)}</span></span>
                </div>
              </div>
              
              {/* InvestButton for project investments */}
              <InvestButton
                projectName={project.name}
                amount={parseFloat(investmentAmount) || 0}
                tokenSymbol={project.project_token_symbol}
                tokenPrice={project.project_token_rate}
                className="py-3 h-auto text-base font-medium"
              />
              
              <div className="mt-4 text-xs text-center text-gray-400">
                <div className="flex items-center justify-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>By investing, you agree to our <a href="/terms" className="text-[#9d00ff] underline">Terms of Use</a> and <a href="/investment-agreement" className="text-[#9d00ff] underline">Investment Agreement</a></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Three-column information layout */}
      <div className="bg-gradient-to-b from-black to-[#0e0e15]">
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
            {/* Token Information */}
            <div className="bg-[#1a1a24] rounded-xl p-6 border border-gray-800 md:col-span-4">
              <h3 className="text-xl text-white font-semibold mb-4 font-heading">Token Information</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-[#707E89] font-medium">Token Ticker</span>
                  <span className="text-white font-medium">{project.project_token_symbol}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-[#707E89] font-medium">Token Name</span>
                  <span className="text-white font-medium">{project.project_token_name}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-[#707E89] font-medium">Token Price</span>
                  <span className="text-white font-medium">${project.project_token_rate}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-[#707E89] font-medium">Initial Supply</span>
                  <span className="text-white font-medium">
                    {tokenomics.initial_supply?.toLocaleString() || 'TBA'}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-[#707E89] font-medium">Network</span>
                  <span className="text-white font-medium">Solana</span>
                </div>
              </div>
            </div>
            
            {/* Pool Information */}
            <div className="bg-[#1a1a24] rounded-xl p-6 border border-gray-800 md:col-span-4">
              <h3 className="text-xl text-white font-semibold mb-4 font-heading">Pool Information</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#707E89] font-medium">Total Raised</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">${project.total_raised.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[#707E89] font-medium">Funding Goal</span>
                  <span className="text-white font-medium">${project.funding_goal.toLocaleString()}</span>
                </div>
                
                <div className="mt-2 mb-4">
                  <Progress value={fundingProgress} className="h-2 bg-gray-800" indicatorClassName="bg-[#9d00ff]" />
                  <div className="flex justify-between mt-1 text-xs text-[#707E89]">
                    <span>0%</span>
                    <span>{fundingProgress.toFixed(1)}%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[#707E89] font-medium">Start Date</span>
                  <span className="text-white font-medium">{formatDate(project.launch_date)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[#707E89] font-medium">End Date</span>
                  <span className="text-white font-medium">{formatDate(project.end_date)}</span>
                </div>
              </div>
            </div>
            
            {/* Vesting Information */}
            <div className="bg-[#1a1a24] rounded-xl p-6 border border-gray-800 md:col-span-4">
              <h3 className="text-xl text-white font-semibold mb-4 font-heading">Vesting Schedule</h3>
              
              <div className="space-y-4">
                {/* Allocation section */}
                {Object.entries(tokenomics.allocation || {}).map(([key, value]) => (
                  <div key={key} className="overflow-hidden">
                    <table className="w-full table-fixed">
                      <tbody>
                        <tr>
                          <td className="text-[#707E89] font-medium capitalize w-1/2">{key}</td>
                          <td className="text-white font-medium text-right">{value}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
                
                <div className="border-t border-gray-800 my-2 pt-2"></div>
                
                {/* Distribution row */}
                <div className="overflow-hidden">
                  <table className="w-full table-fixed">
                    <tbody>
                      <tr>
                        <td className="text-[#707E89] font-medium w-1/2">Distribution</td>
                        <td className="text-white font-medium text-right">Linear</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Vesting items */}
                {Object.entries(tokenomics.vesting || {}).filter(([key]) => key !== 'distribution').map(([key, value]) => (
                  <div key={key} className="overflow-hidden">
                    <table className="w-full table-fixed">
                      <tbody>
                        <tr>
                          <td className="text-[#707E89] font-medium capitalize w-1/2">{key} Vesting</td>
                          <td className="text-white font-medium text-right">{value}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-6 mt-4">
              <div className="flex space-x-8 border-b border-[#e5e7eb]">
                <button 
                  className={`py-3 px-1 font-semibold font-heading relative text-base ${activeTab === 'overview' ? 'text-[#9d00ff]' : 'text-[#111] hover:text-[#9d00ff]'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                  {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#9d00ff]"></div>}
                </button>
                <button 
                  className={`py-3 px-1 font-semibold font-heading relative text-base ${activeTab === 'tokenomics' ? 'text-[#9d00ff]' : 'text-[#111] hover:text-[#9d00ff]'}`}
                  onClick={() => setActiveTab('tokenomics')}
                >
                  Tokenomics
                  {activeTab === 'tokenomics' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#9d00ff]"></div>}
                </button>
                <button 
                  className={`py-3 px-1 font-semibold font-heading relative text-base ${activeTab === 'team' ? 'text-[#9d00ff]' : 'text-[#111] hover:text-[#9d00ff]'}`}
                  onClick={() => setActiveTab('team')}
                >
                  Team
                  {activeTab === 'team' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#9d00ff]"></div>}
                </button>
              </div>
            </div>
            
            {/* Tab content */}
            <div>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="text-white">
                  {/* Project title and description - manually extracted from API data */}
                  <div className="text-[#707E89] leading-relaxed mt-8 mb-8">
                    <p className="text-xl font-semibold text-black mb-4 font-heading">AI Fusion: Revolutionary Enterprise Data Analytics</p>
                    <p>AI Fusion creates breakthrough self-learning algorithms that enhance enterprise data analytics capabilities. Our system integrates seamlessly with existing business intelligence tools while providing advanced fraud detection capabilities that adapt to emerging threats.</p>
                  </div>
                  
                  {/* Key Features - only show once */}
                  <div className="mt-8 mb-8">
                    <h3 className="text-xl font-semibold text-black mb-4 font-heading">Key Features</h3>
                    <ul className="list-disc list-outside pl-5 space-y-2 text-[#707E89]">
                      <li>Real-time anomaly detection with 99.7% accuracy</li>
                      <li>Seamless integration with existing BI tools</li>
                      <li>Self-optimizing algorithms requiring minimal human oversight</li>
                      <li>Data privacy preservation through federated learning</li>
                      <li>Custom alert systems for different threat levels</li>
                    </ul>
                  </div>
                  
                  <div className="pt-8 mt-8 border-t border-[#e5e7eb]">
                    <h3 className="text-xl font-semibold mb-5 font-heading text-black">Project Timeline</h3>
                    <div className="space-y-8 mb-12">
                      <div className="flex">
                        <div className="mr-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#9d00ff]/10 text-[#9d00ff]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-md font-semibold text-black font-heading">Funding Start</h4>
                          <p className="text-[#707E89]">{formatDate(project.launch_date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="mr-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#9d00ff]/10 text-[#9d00ff]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-md font-semibold text-black font-heading">Funding End</h4>
                          <p className="text-[#707E89]">{formatDate(project.end_date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="mr-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#9d00ff]/10 text-[#9d00ff]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-md font-semibold text-black font-heading">Project Launch</h4>
                          <p className="text-[#707E89]">Estimated Q3 2025</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Team Tab */}
              {activeTab === 'team' && (
                <div className="text-white">
                  <div className="text-[#707E89] leading-relaxed mt-8 mb-8">
                    <p className="text-xl font-semibold text-black mb-4 font-heading">Meet the Team</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="bg-[#1a1a24] border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <Image 
                            src={member.image || '/placeholder-avatar.png'} 
                            alt={member.name}
                            width={100}
                            height={100}
                            className="rounded-full object-cover w-[100px] h-[100px] border-2 border-[#9d00ff]/30"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{member.name}</h3>
                          <p className="text-sm text-[#9d00ff] mb-2 font-medium">{member.role}</p>
                          <div className="text-sm text-[#707E89] leading-relaxed" 
                               dangerouslySetInnerHTML={{ __html: parseMarkdown(member.bio) }}>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tokenomics Tab */}
              {activeTab === 'tokenomics' && (
                <div className="text-white">
                  <div className="text-[#707E89] leading-relaxed mt-8 mb-8">
                    <p className="text-xl font-semibold text-black mb-4 font-heading">Token Details</p>
                  </div>
                  
                  <div className="mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#1a1a24] border border-gray-800 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Token Name</p>
                        <p className="font-bold text-white">{tokenomics.token_name}</p>
                      </div>
                      <div className="p-4 bg-[#1a1a24] border border-gray-800 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Token Symbol</p>
                        <p className="font-bold text-white">{tokenomics.token_symbol}</p>
                      </div>
                      <div className="p-4 bg-[#1a1a24] border border-gray-800 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Initial Supply</p>
                        <p className="font-bold text-white">{tokenomics.initial_supply?.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-[#1a1a24] border border-gray-800 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Token Price</p>
                        <p className="font-bold text-white">${project.project_token_rate}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-10 mt-8">
                    <h3 className="text-xl font-semibold mb-6 font-heading text-black">Token Allocation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(tokenomics.allocation || {}).map(([key, value]) => {
                        const percentage = parsePercentage(value);
                        const numericValue = parseInt(percentage, 10);
                        return (
                          <div key={key} className="bg-[#1a1a24] p-4 rounded-lg border border-gray-800">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white font-medium capitalize">{key}</span>
                              <span className="text-[#9d00ff] font-bold">{percentage}</span>
                            </div>
                            <div className="w-full bg-gray-800 h-6 rounded-full relative overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-[#9d00ff]" 
                                style={{ width: numericValue + '%' }}
                              >
                                <span className="sr-only">{percentage} allocated to {key}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mb-24">
                    <h3 className="text-xl font-semibold mb-6 font-heading text-black">Vesting Schedule</h3>
                    
                    {/* List-based approach for vesting schedule items */}
                    <div className="space-y-4">
                      {/* First distribution card */}
                      <div className="bg-[#1a1a24] rounded-lg border border-gray-800 overflow-hidden">
                        <table className="w-full table-fixed">
                          <tbody>
                            <tr>
                              <td className="p-4 w-1/3 sm:w-1/4 text-gray-400 font-medium">Distribution</td>
                              <td className="p-4 text-right text-white font-medium">Linear</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Remaining vesting items */}
                      {Object.entries(tokenomics.vesting || {}).filter(([key]) => key !== 'distribution').map(([key, value]) => (
                        <div key={key} className="bg-[#1a1a24] rounded-lg border border-gray-800 overflow-hidden">
                          <table className="w-full table-fixed">
                            <tbody>
                              <tr>
                                <td className="p-4 w-1/3 sm:w-1/4 text-gray-400 font-medium capitalize">{key}</td>
                                <td className="p-4 text-right text-white font-medium">{value}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Investment Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24 mb-16 mt-4">
              <h2 className="text-xl font-semibold mb-4 font-heading">Project Details</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <div className="flex items-center mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      project.status === 'active' ? 'bg-green-500' : 
                      project.status === 'upcoming' ? 'bg-blue-500' : 
                      project.status === 'completed' ? 'bg-gray-500' : 'bg-red-500'
                    }`}></span>
                    <p className="font-medium capitalize">{project.status}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-500 text-sm">Minimum Tier Required</p>
                  <p className="font-medium">Tier {project.tier_requirement}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 text-sm">Launch Date</p>
                  <p className="font-medium">{formatDate(project.launch_date)}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 text-sm">End Date</p>
                  <p className="font-medium">{formatDate(project.end_date)}</p>
                </div>
              </div>
              
              <div className="mb-8 mt-10">
                <div className="flex justify-between mb-2">
                  <p className="font-semibold font-heading text-black">Funding Progress</p>
                  <p className="font-semibold">{fundingProgress.toFixed(0)}%</p>
                </div>
                <Progress value={fundingProgress} className="h-2 bg-gray-200" indicatorClassName="bg-[#9d00ff]" />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <p>${project.total_raised.toLocaleString()} raised</p>
                  <p>Goal: ${project.funding_goal.toLocaleString()}</p>
                </div>
              </div>
              
              {project.status === 'active' && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3 font-heading text-black">Invest in {project.name}</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={investmentAmount || ''}
                        onChange={handleInvestmentAmountChange}
                        className="block w-full pl-7 py-2 border-2 border-gray-300 rounded-md focus:border-[#9d00ff] focus:ring-[#9d00ff] sm:text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6 p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between text-sm">
                      <span>You'll receive:</span>
                      <span className="font-medium">{calculateTokenAmount().toLocaleString()} {project.project_token_symbol}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span>Token price:</span>
                      <span className="font-medium">${project.project_token_rate} USD</span>
                    </div>
                  </div>
                  
                  <InvestButton 
                    projectName={project.name}
                    amount={parseFloat(investmentAmount) || 0} 
                    tokenSymbol={project.project_token_symbol}
                    tokenPrice={project.project_token_rate}
                    className="w-full bg-[#9d00ff] hover:bg-[#9d00ff]/90 text-white py-3 rounded-[100px] font-medium transition-all duration-200 h-auto"
                  />
                  
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Tier {project.tier_requirement} or higher required
                  </p>
                </div>
              )}
              
              {project.status === 'upcoming' && (
                <button className="w-full bg-gray-400 text-white py-3 rounded-[100px] font-medium cursor-not-allowed">
                  Coming Soon
                </button>
              )}
              
              {project.status === 'completed' && (
                <Button className="w-full" disabled>
                  Funding Completed
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
