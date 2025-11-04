'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/main-layout';

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MainLayout>
      <div className="min-h-screen pt-32 pb-16 px-4 md:px-6 flex flex-col items-center">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold font-heading mb-6">Error Loading Project</h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700 mb-4">
              Error fetching project: {error.message || 'Something went wrong'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => reset()}
                className="border-[#FA6906] text-[#FA6906] hover:bg-[#FA6906]/10"
              >
                Try Again
              </Button>
              
              <Link href="/projects">
                <Button className="bg-[#FA6906] hover:bg-[#FA6906]/90 text-white">
                  Return to Projects
                </Button>
              </Link>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            If this issue persists, please contact our support team at{' '}
            <a href="mailto:support@otonom.fund" className="text-[#FA6906] underline">
              support@otonom.fund
            </a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
