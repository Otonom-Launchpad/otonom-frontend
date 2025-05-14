import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';

export default function ProjectsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Projects</h1>
        <p className="text-xl text-slate-600">This section is coming soon!</p>
        <p className="mt-8">
          <a href="/" className="text-blue-600 hover:underline">
            &larr; Go back to Homepage
          </a>
        </p>
      </div>
    </MainLayout>
  );
}
