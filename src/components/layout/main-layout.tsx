'use client';

import React from 'react';
import { Header } from './header';
import { Footer } from './footer';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 w-full mx-auto max-w-[2000px] px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}