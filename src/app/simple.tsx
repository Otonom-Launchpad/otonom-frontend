'use client';

import React from 'react';
import { SimpleLayout } from '@/components/layout/simple-layout';
import { HeroSection } from '@/components/home/hero-section';

export default function SimplePage() {
  return (
    <SimpleLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Simplified Page</h1>
        <p className="mb-8">This is a simplified page to test rendering without wallet integration.</p>
        <HeroSection />
      </div>
    </SimpleLayout>
  );
}
