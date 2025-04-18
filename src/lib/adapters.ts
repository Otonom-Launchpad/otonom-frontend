/**
 * Data adapters to transform API/database data into formats expected by UI components
 */

// Database project type (from Supabase)
export interface DbProject {
  id: string;
  name: string;
  short_description: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  website_url?: string;
  twitter_url?: string;
  team_info?: any;
  tokenomics?: any;
  project_token_name?: string;
  project_token_symbol?: string;
  project_token_rate?: number;
  funding_goal: number;
  total_raised: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  launch_date?: string;
  end_date?: string;
  tier_requirement?: number;
}

// UI project type (expected by components)
export interface UiProject {
  id: number | string;
  name: string;
  category: string;
  description: string;
  fundingGoal: number;
  fundingRaised: number;
  investors: number;
  imageUrl?: string;
  status: 'Active' | 'Completed' | 'Upcoming';
  date?: string;
  isPublic: boolean;
}

/**
 * Transforms a project from Supabase format to the format expected by the UI components
 */
export function adaptProjectForUI(supabaseProject: DbProject): UiProject {
  if (!supabaseProject) {
    throw new Error('Cannot adapt undefined project');
  }

  // Calculate a consistent numeric ID if needed for UI components that expect numbers
  const numericId = parseInt(supabaseProject.id) || 
    Math.abs(supabaseProject.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 1000);
  
  // Determine a consistent placeholder image based on project ID
  const placeholderImages = [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bmV1cmFsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8YWklMjByb2JvdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1495592822108-9e6261896da8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
  ];

  // Get index based on project ID
  const idStr = String(supabaseProject.id);
  const imageIndex = Math.abs(idStr.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % placeholderImages.length;
  
  // Make sure we have a valid image URL
  // Much more strict validation of image URLs
  const isValidImageUrl = (url?: string): boolean => {
    if (!url) return false;
    if (!url.startsWith('http')) return false;
    
    // Ensure it's a common image format
    const hasImageExtension = /\.(jpe?g|png|gif|webp|avif|svg)($|\?)/i.test(url);
    // Or comes from a known image hosting service
    const fromImageHost = (
      url.includes('unsplash.com') || 
      url.includes('pixabay.com') || 
      url.includes('pexels.com') ||
      url.includes('imgur.com') ||
      url.includes('cloudinary.com')
    );
    
    return hasImageExtension || fromImageHost;
  };
  
  // Special case for AI Fusion which seems to have image loading issues
  let imageUrl;
  
  if (supabaseProject.name === 'AI Fusion') {
    // Force a specific image for AI Fusion
    imageUrl = 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8YWklMjByb2JvdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=80';
  } else {
    // For all other projects, use the validation logic
    imageUrl = isValidImageUrl(supabaseProject.image_url) 
      ? supabaseProject.image_url 
      : placeholderImages[imageIndex];
  }
    
  return {
    id: numericId,
    name: supabaseProject.name,
    category: supabaseProject.project_token_symbol || 'AI',
    description: supabaseProject.short_description,
    fundingGoal: supabaseProject.funding_goal,
    fundingRaised: supabaseProject.total_raised,
    investors: Math.floor((supabaseProject.total_raised || 0) / 10000) || 0, // Approximate based on funding
    imageUrl: imageUrl, // Use our improved image selection logic
    status: mapStatus(supabaseProject.status),
    date: formatDate(supabaseProject.end_date),
    isPublic: true,
  };
}

/**
 * Maps database status values to UI status values
 */
function mapStatus(status: string | undefined): 'Active' | 'Completed' | 'Upcoming' {
  if (!status) return 'Upcoming';
  
  switch (status.toLowerCase()) {
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'upcoming':
      return 'Upcoming';
    default:
      return 'Upcoming';
  }
}

/**
 * Formats a date string into a readable format
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}
