'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProjectCard } from '@/components/projects/project-card';
import { Button } from '@/components/ui/button';
import { adaptProjectForUI, UiProject, DbProject } from '@/lib/adapters';

// Mock project data mapping to our real project UUIDs
const featuredProjects = [
  {
    id: 'aa9ef18d-1644-4af4-b1e8-f5f1d95eccf3', // Cortex Mind
    name: 'Cortex Mind',
    category: 'BCI Technology',
    description: 'AI-driven brain-computer interface optimizing treatment for neurological disorders.',
    fundingGoal: 6000000,
    fundingRaised: 1200000,
    investors: 1243,
    imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1000',
    status: 'Active' as const,
    date: '04/05/2025',
    isPublic: true,
  },
  {
    id: '1b4115dc-7280-4b90-8c23-0034fb05fdf1', // AI Fusion
    name: 'AI Fusion',
    category: 'Enterprise Analytics',
    description: 'Self-learning AI model for enterprise data analytics with built-in fraud detection.',
    fundingGoal: 3000000,
    fundingRaised: 1800000,
    investors: 587,
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000',
    status: 'Active' as const,
    date: '04/01/2025',
    isPublic: true,
  },
  {
    id: 'f10c5123-0f73-48c6-be9d-ca2478051916', // Neural Bridge
    name: 'Neural Bridge',
    category: 'Decentralized AI',
    description: 'Decentralized AI knowledge marketplace connecting specialized models through secure computing.',
    fundingGoal: 5000000,
    fundingRaised: 3250000,
    investors: 1875,
    imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=1000',
    status: 'Active' as const,
    date: '03/15/2025',
    isPublic: true,
  },
];

// Additional projects for explore section
const exploreProjects = [
  {
    id: 4,
    name: 'Quantum AI Network',
    category: 'Quantum Computing',
    description: 'Harnessing quantum computing to enhance AI learning capabilities beyond classical limitations.',
    fundingGoal: 2300000,
    fundingRaised: 1470000,
    investors: 1875,
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    status: 'Active' as const,
    date: '2/22/2024',
    isPublic: true,
  },
  {
    id: 5,
    name: 'MediScan AI',
    category: 'Healthcare',
    description: 'Revolutionary healthcare diagnostics using machine learning for early disease detection from medical imaging.',
    fundingGoal: 1800000,
    fundingRaised: 765000,
    investors: 1243,
    imageUrl: 'https://images.unsplash.com/photo-1576671081803-5dcb9836dc61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    status: 'Active' as const,
    date: '3/10/2024',
    isPublic: true,
  },
  {
    id: 6,
    name: 'AgriTech Intelligence',
    category: 'Agriculture',
    description: 'Smart farming solutions powered by AI to optimize crop yields, reduce resource usage, and promote sustainable agriculture.',
    fundingGoal: 950000,
    fundingRaised: 640000,
    investors: 876,
    imageUrl: 'https://images.unsplash.com/photo-1626908013351-800ddd7b181c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    status: 'Active' as const,
    date: '3/5/2024',
    isPublic: true,
  },
  {
    id: 7,
    name: 'DataSecure AI',
    category: 'Cybersecurity',
    description: 'Advanced threat detection and prevention using AI to identify patterns and anomalies in network traffic.',
    fundingGoal: 1700000,
    fundingRaised: 1360000,
    investors: 1450,
    imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    status: 'Active' as const,
    date: '2/18/2024',
    isPublic: true,
  },
  {
    id: 8,
    name: 'VisionArt Creator',
    category: 'Creative AI',
    description: 'Next-generation AI art platform allowing creators to transform ideas into visual masterpieces with unique style transfer algorithms.',
    fundingGoal: 750000,
    fundingRaised: 520000,
    investors: 3200,
    imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    status: 'Active' as const,
    date: '1/30/2024',
    isPublic: true,
  },
  {
    id: 9,
    name: 'FinPredict Analytics',
    category: 'FinTech',
    description: 'Predictive financial analytics using deep learning to forecast market trends and optimize investment strategies.',
    fundingGoal: 1250000,
    fundingRaised: 980000,
    investors: 564,
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3ab2f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    status: 'Active' as const,
    date: '2/05/2024',
    isPublic: true,
  },
];

export function FeaturedProjectsSection() {
  // Start with an empty array to avoid flashing mock data
  const [projects, setProjects] = useState<UiProject[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading=true
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch('/api/projects?status=active&limit=3');
        
        if (!response.ok) {
          throw new Error(`Error fetching projects: ${response.statusText}`);
        }
        
        const supabaseProjects = await response.json();
        
        // If we got valid data, adapt and use it
        if (Array.isArray(supabaseProjects) && supabaseProjects.length > 0) {
          try {
            // Type check the data and transform it
            const dbProjects = supabaseProjects as DbProject[];
            // Transform the Supabase data to match our UI component's expected format
            const adaptedProjects = dbProjects.map(project => {
              try {
                return adaptProjectForUI(project);
              } catch (err) {
                console.error('Failed to adapt project:', project.id, err);
                return null;
              }
            }).filter((project): project is UiProject => project !== null);
            
            // Only update if we have adapted projects
            if (adaptedProjects.length > 0) {
              setProjects(adaptedProjects);
            } else {
              // If no adapted projects, use mock data as fallback
              setProjects(featuredProjects as UiProject[]);
            }
          } catch (err) {
            console.error('Error processing projects:', err);
            setProjects(featuredProjects as UiProject[]); // Fallback to mock data
          }
        } else {
          // If we don't get any projects from API, use mock data
          setProjects(featuredProjects as UiProject[]);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setProjects(featuredProjects as UiProject[]); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjects();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight font-heading mb-4">Featured AI Projects</h2>
            <p className="text-slate-600 max-w-[600px]">
              Discover innovative AI solutions that are reshaping industries and creating new possibilities with blockchain technology.
            </p>
          </div>
          <Link href="/projects" className="mt-4 md:mt-0 text-[#9d00ff] hover:underline font-medium">
            View all projects
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {loading ? (
            // Loading placeholders that match the dimensions of the actual cards
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="overflow-hidden border border-slate-200 shadow-sm rounded-lg animate-pulse">
                <div className="h-80 bg-slate-200"></div>
                <div className="p-8">
                  <div className="space-y-4 mb-8">
                    <div className="h-6 bg-slate-200 w-3/4 rounded"></div>
                    <div className="h-4 bg-slate-200 w-1/4 rounded"></div>
                    <div className="h-4 bg-slate-200 w-full rounded"></div>
                  </div>
                  <div className="space-y-4 my-8">
                    <div className="h-3 bg-slate-200 rounded-full w-full"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-slate-200 w-20 rounded"></div>
                      <div className="h-4 bg-slate-200 w-20 rounded"></div>
                    </div>
                    <div className="h-4 bg-slate-200 w-32 rounded"></div>
                  </div>
                  <div className="h-10 bg-slate-200 w-full rounded-full mt-6"></div>
                </div>
              </div>
            ))
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}