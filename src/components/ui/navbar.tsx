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
        <Link href="/" className="text-2xl font-bold text-[#FA6906]">
          Seismic Fund
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          <Link 
            href="/projects" 
            className={`${pathname === '/projects' ? 'text-[#FA6906]' : 'text-gray-600 hover:text-[#FA6906]'}`}
          >
            Projects
          </Link>
          <Link 
            href="/about" 
            className={`${pathname === '/about' ? 'text-[#FA6906]' : 'text-gray-600 hover:text-[#FA6906]'}`}
          >
            About
          </Link>
          <Link 
            href="/faq" 
            className={`${pathname === '/faq' ? 'text-[#FA6906]' : 'text-gray-600 hover:text-[#FA6906]'}`}
          >
            FAQ
          </Link>
        </nav>
        
        <WalletMultiButton />
      </div>
    </header>
  );
}