'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedProjectsSection } from '@/components/home/featured-projects-section';
import { ExploreProjectsSection } from '@/components/home/explore-projects-section';
import { StayUpdatedSection } from '@/components/home/stay-updated-section';

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturedProjectsSection />
      <ExploreProjectsSection />
      <StayUpdatedSection />
    </MainLayout>
  );
}
