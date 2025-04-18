'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/main-layout';

export default function ProjectNotFound() {
  return (
    <MainLayout>
      <div className="min-h-screen pt-32 pb-16 px-4 md:px-6 flex flex-col items-center">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold font-heading mb-6">Project Not Found</h1>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700 mb-4">
              The project you're looking for doesn't exist or may have been removed.
            </p>
            
            <div className="flex justify-center">
              <Link href="/projects">
                <Button className="bg-[#9d00ff] hover:bg-[#9d00ff]/90 text-white">
                  Browse All Projects
                </Button>
              </Link>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            If you believe this is an error, please contact our support team at{' '}
            <a href="mailto:support@otonom.fund" className="text-[#9d00ff] underline">
              support@otonom.fund
            </a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
