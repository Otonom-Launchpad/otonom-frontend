'use client';

import React from 'react';
import { Header } from './header';
import { Footer } from './footer';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 w-full">
        <div className="w-full">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}