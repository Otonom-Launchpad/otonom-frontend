'use client';

import React, { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/projects/project-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  short_description: string;
  logo_url: string;
  image_url: string;
  project_token_symbol: string;
  project_token_rate: number;
  total_raised: number;
  funding_goal: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  tier_requirement: number;
  end_date: string;
}

export function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Fetch active projects with a limit of 3
        const response = await fetch('/api/projects?status=active&limit=3');
        
        if (!response.ok) {
          throw new Error(`Error fetching projects: ${response.statusText}`);
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError((err as Error).message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured Projects</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-[380px] animate-pulse">
                <div className="h-40 bg-gray-300 rounded-t-lg"></div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                    <div className="h-6 w-36 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-2 bg-gray-300 rounded w-full mt-4"></div>
                  <div className="flex justify-between pt-2">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
            <p className="text-gray-600 mb-8">Unable to load projects at this time. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
            <p className="text-gray-600 mb-8">No active projects available at the moment. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Featured Projects</h2>
          <Link href="#" className="text-[#9d00ff] font-medium hover:text-[#8400d6]">
            View All Projects
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={parseInt(project.id) || Math.floor(Math.random() * 1000)} // The original component expects a number
              name={project.name}
              category={project.project_token_symbol || 'AI'}
              description={project.short_description}
              fundingGoal={project.funding_goal}
              fundingRaised={project.total_raised}
              investors={Math.floor(project.total_raised / 10000)} // Estimated investors
              imageUrl={project.image_url}
              status={project.status === 'active' ? 'Active' : 
                     project.status === 'upcoming' ? 'Upcoming' : 
                     project.status === 'completed' ? 'Completed' : 'Active'}
              date={new Date(project.end_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
