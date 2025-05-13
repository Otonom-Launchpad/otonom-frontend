import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProjectCardProps {
  id: number | string;
  name: string;
  category: string;
  description: string;
  fundingGoal: number;
  fundingRaised: number;
  investors: number;
  imageUrl?: string;
  status?: 'Active' | 'Completed' | 'Upcoming';
  date?: string;
  isPublic?: boolean;
}

// Helper function to identify featured projects by ID
function isFeaturedProject(projectId: string | number, projectName?: string): boolean {
  // Check based on UUID for featured projects
  const featuredProjectIds = [
    'f10c5123-0f73-48c6-be9d-ca2478051916', // Neural Bridge
    '1b4115dc-7280-4b90-8c23-0034fb05fdf1', // AI Fusion
    'aa9ef18d-1644-4af4-b1e8-f5f1d95eccf3', // Cortex Mind 
    '02d0b171-7268-4155-b79d-fea9b42d8a2b',  // QuantumAI (from fix-project-images.ts)
    'quantumai'  // QuantumAI (in case it's using the slug)
  ];
  
  // Also check based on project name for additional safety
  const featuredNames = ['Neural Bridge', 'AI Fusion', 'QuantumAI', 'Cortex Mind'];
  
  // Ensure we return a boolean
  if (typeof projectId === 'string' && featuredProjectIds.includes(projectId.toLowerCase())) {
    return true;
  }
  
  // Check based on name as fallback
  if (projectName && featuredNames.includes(projectName)) {
    return true;
  }
  
  return false;
}

export function ProjectCard({
  id,
  name,
  category,
  description,
  fundingGoal,
  fundingRaised,
  investors,
  imageUrl,
  status = 'Active',
  date,
  isPublic = true,
}: ProjectCardProps) {
  const fundingPercentage = Math.round((fundingRaised / fundingGoal) * 100);
  
  // Use default placeholder images for projects without images
  const defaultPlaceholders = [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    'https://images.unsplash.com/photo-1639322537504-6427a16b0a28?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    'https://images.unsplash.com/photo-1673187648775-1c9e4a426f16?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    'https://images.unsplash.com/photo-1681412332117-5d3c6a62b7b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    'https://images.unsplash.com/photo-1682687982107-14492010e05e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    'https://images.unsplash.com/photo-1680169291866-9b8b3d1c3b05?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
    'https://images.unsplash.com/photo-1679591989815-3e1c0e3f9e94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80',
  ];
  
  // Select a placeholder based on the project ID to ensure consistency
  const placeholderImage = defaultPlaceholders[typeof id === 'number' ? id % defaultPlaceholders.length : 0];
  
  return (
    <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-lg transition-shadow hover:shadow-md">
      <div 
        className="h-80 bg-gradient-to-br from-slate-100 to-slate-200 relative"
        style={{ backgroundImage: `url(${imageUrl || placeholderImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* If in the Explore section (non-featured projects), always show as Upcoming */}
        {(!isFeaturedProject(id, name) && typeof id === 'number') ? (
          <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded-md font-medium bg-yellow-100 text-yellow-800">
            Upcoming
          </div>
        ) : (
          <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-md font-medium ${
            status === 'Active' ? 'bg-green-100 text-green-800' : 
            status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status}
          </div>
        )}
      </div>
      
      <div className="p-8">
        <div className="space-y-4 mb-8">
          <h3 className="font-semibold text-xl font-heading mt-2">{name}</h3>
          <div className="flex items-center text-sm text-slate-500 mt-3">
            <span className="bg-[#9d00ff]/10 text-[#9d00ff] rounded-full px-3 py-1 text-xs font-medium">
              {category}
            </span>
            {date && <span className="mx-2">•</span>}
            {date && <span>{date}</span>}
          </div>
          <p className="text-slate-600 line-clamp-2 mt-3 mb-2">{description}</p>
        </div>

        {fundingGoal > 0 && (
          <div className="space-y-4 my-8">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden my-4">
              <div 
                className="h-full bg-[#9d00ff]" 
                style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                aria-label={`${fundingPercentage}% funded`}
              />
            </div>
            
            <div className="flex justify-between text-sm my-3">
              <span className="font-medium text-[#9d00ff]">
                ${(fundingRaised / 1000).toLocaleString()}k
              </span>
              <span className="text-slate-500">
                ${(fundingGoal / 1000).toLocaleString()}k Goal
              </span>
            </div>

            <div className="flex items-center text-sm text-slate-500 mt-3 mb-2">
              <span>{investors.toLocaleString()} investors</span>
            </div>
          </div>
        )}

        {/* For featured projects, keep the link active */}
        {isFeaturedProject(id, name) ? (
          <Link href={`/project/${id}`} className="block mt-6">
            <Button className="w-full bg-black hover:bg-black/80 text-white rounded-full py-3 h-auto font-medium">
              View Project
            </Button>
          </Link>
        ) : (
          /* For all other projects, show a disabled "Coming Soon" button */
          <div className="block mt-6">
            <Button 
              disabled 
              className="w-full bg-gray-700 text-white rounded-full py-3 h-auto font-medium cursor-not-allowed opacity-80"
            >
              Coming Soon
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}