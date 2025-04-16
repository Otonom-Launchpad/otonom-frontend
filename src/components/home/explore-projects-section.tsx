import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectCard } from '@/components/projects/project-card';

// Project data with proper images for all projects
const PROJECTS_DATA = [
  {
    id: 1,
    name: "NeuralCast AI",
    description: "End-to-end neural network development platform for automated ML models.",
    category: "Development",
    date: "April 8, 2023",
    status: 'Active' as const,
    fundingGoal: 180000,
    fundingRaised: 82500,
    investors: 124,
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80"
  },
  {
    id: 2,
    name: "AI-FedTech",
    description: "Federated learning platform for decentralized AI model training.",
    category: "Infrastructure",
    date: "March 29, 2023",
    status: 'Completed' as const,
    fundingGoal: 250000,
    fundingRaised: 250000,
    investors: 178,
    imageUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80"
  },
  {
    id: 3,
    name: "LangMind AI",
    description: "Open source framework for building multimodal language models.",
    category: "Language Models",
    date: "May 10, 2023",
    status: 'Upcoming' as const,
    fundingGoal: 500000,
    fundingRaised: 0,
    investors: 0,
    imageUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80"
  },
  {
    id: 4,
    name: "DataSecure AI",
    category: "Cybersecurity",
    description: "Advanced threat detection and prevention using AI to identify patterns and anomalies in network traffic.",
    fundingGoal: 1700000,
    fundingRaised: 1360000,
    investors: 1450,
    date: "2/18/2024",
    status: 'Active' as const,
    imageUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80"
  },
  {
    id: 5,
    name: "VisionArt Creator",
    category: "Creative AI",
    description: "Next-generation AI art platform allowing creators to transform ideas into visual masterpieces with unique style transfer algorithms.",
    fundingGoal: 750000,
    fundingRaised: 520000,
    investors: 3200,
    date: "1/30/2024",
    status: 'Active' as const,
    imageUrl: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80"
  },
  {
    id: 6,
    name: "FinPredict Analytics",
    category: "FinTech",
    description: "Predictive financial analytics using deep learning to forecast market trends and optimize investment strategies.",
    fundingGoal: 1250000,
    fundingRaised: 980000,
    investors: 564,
    date: "2/05/2024",
    status: 'Active' as const,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80"
  }
];

export function ExploreProjectsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-semibold tracking-tight mb-4 font-heading">Explore AI Projects</h2>
          <p className="text-slate-600">
            Discover and fund the most promising AI projects that are pushing the boundaries of what's possible in various industries.
          </p>
        </div>
        
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              type="text"
              placeholder="Search projects..."
              className="pl-10 py-6 rounded-full border-slate-200"
            />
          </div>
        </div>
        
        <div className="mb-12 w-full overflow-hidden">
          <div className="max-w-xl mx-auto overflow-x-auto pb-2">
            <div className="flex justify-center w-full">
              <div className="w-full md:w-auto flex md:inline-flex justify-between bg-white rounded-full p-1 border border-slate-200 whitespace-nowrap">
                <Button variant="ghost" className="flex-1 md:flex-initial rounded-full px-2 sm:px-4 md:px-6 py-2.5 text-xs sm:text-sm font-medium bg-black text-white min-w-[60px]">
                  All
                </Button>
                <Button variant="ghost" className="flex-1 md:flex-initial rounded-full px-2 sm:px-4 md:px-6 py-2.5 text-xs sm:text-sm font-medium text-slate-700 min-w-[60px]">
                  Active
                </Button>
                <Button variant="ghost" className="flex-1 md:flex-initial rounded-full px-2 sm:px-4 md:px-6 py-2.5 text-xs sm:text-sm font-medium text-slate-700 min-w-[60px]">
                  Upcoming
                </Button>
                <Button variant="ghost" className="flex-1 md:flex-initial rounded-full px-2 sm:px-4 md:px-6 py-2.5 text-xs sm:text-sm font-medium text-slate-700 min-w-[60px]">
                  Completed
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROJECTS_DATA.map((project) => (
            <ProjectCard 
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description}
              category={project.category}
              date={project.date}
              status={project.status}
              fundingGoal={project.fundingGoal}
              fundingRaised={project.fundingRaised}
              investors={project.investors}
              imageUrl={project.imageUrl}
            />
          ))}
        </div>
        
        <div className="text-center">
          <Link href="/projects">
            <Button variant="outline" className="rounded-full px-8 mt-10">
              View All Projects
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}