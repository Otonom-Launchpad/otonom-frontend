'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';

export function SimpleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="flex-1">
            <Link href="/" className="flex items-center">
              <div className="h-9 w-auto flex items-center">
                <img src="/images/Otonom Logo.svg" alt="Otonom Fund" className="h-9" />
              </div>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 pt-20">
        {children}
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-white py-10 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} Otonom Fund. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
