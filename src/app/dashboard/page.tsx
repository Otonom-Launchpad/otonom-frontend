'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [loading, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        <span className="ml-2">Loading your dashboard...</span>
      </div>
    );
  }

  // Only render dashboard if authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <DashboardOverview user={user} />
    </DashboardLayout>
  );
}
