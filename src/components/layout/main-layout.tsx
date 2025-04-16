'use client';

import React from 'react';
import { Header } from './header';
import { Footer } from './footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-16"> {/* Added padding top to account for fixed header */}
        {children}
      </main>
      <Footer />
    </div>
  );
}