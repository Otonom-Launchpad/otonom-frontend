'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-purple-700">
          Otonom Fund
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          <Link 
            href="/projects" 
            className={`${pathname === '/projects' ? 'text-purple-700' : 'text-gray-600 hover:text-purple-700'}`}
          >
            Projects
          </Link>
          <Link 
            href="/about" 
            className={`${pathname === '/about' ? 'text-purple-700' : 'text-gray-600 hover:text-purple-700'}`}
          >
            About
          </Link>
          <Link 
            href="/faq" 
            className={`${pathname === '/faq' ? 'text-purple-700' : 'text-gray-600 hover:text-purple-700'}`}
          >
            FAQ
          </Link>
        </nav>
        
        <WalletMultiButton />
      </div>
    </header>
  );
}