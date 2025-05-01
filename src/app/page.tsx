'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedProjectsSection } from '@/components/home/featured-projects-section';
import { ExploreProjectsSection } from '@/components/home/explore-projects-section';
import { StayUpdatedSection } from '@/components/home/stay-updated-section';
import { TestInitializeProject } from '@/components/test-initialize-project';

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      {/* Test Button for Program Verification - DEVELOPMENT ONLY */}
      <div className="container mx-auto py-4 flex justify-center">
        <TestInitializeProject />
      </div>
      <FeaturedProjectsSection />
      <ExploreProjectsSection />
      <StayUpdatedSection />
    </MainLayout>
  );
}
