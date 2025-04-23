'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCustomWalletModal } from '@/components/wallet/CustomWalletModalProvider';
import { useAuth } from '@/hooks/useAuth';
import { safeLocalStorageGet, safeLocalStorageSet, safeLocalStorageRemove } from '@/utils/localStorage';

// Import WalletMultiButton for standard wallet connection
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Simple wallet connection button using the standard WalletMultiButton
function ConnectButton({ compact = false }: { compact?: boolean }) {
  return (
    <WalletMultiButton 
      className="rounded-full px-4 py-2 bg-black hover:bg-black/80 text-white"
      style={{
        minWidth: compact ? '100px' : '160px',
        height: '40px',
        fontSize: '14px',
        fontFamily: 'var(--font-inter-tight)',
      }}
    />
  )
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroHeight = window.innerHeight * 0.3; // 30% of viewport height
      
      if (currentScrollY < 20) {
        // Always show at the very top
        setVisible(true);
      } else if (currentScrollY > heroHeight) {
        // Hide when scrolled past 30% of hero
        setVisible(lastScrollY > currentScrollY); // Show when scrolling up
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 h-20 bg-white/40 backdrop-blur-md border-b border-gray-100/20 transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-4 h-full flex items-center">
        <div className="flex-1">
          <Link href="/" className="flex items-center">
            <div className="h-9 w-auto flex items-center">
              <img src="/images/Otonom Logo.svg" alt="Otonom Fund" className="h-9" />
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center justify-center flex-1">
          <div className="flex space-x-8">
            <Link 
              href="/" 
              className={`text-sm font-medium ${pathname === '/' || pathname === '/projects' ? 'text-purple-700' : 'text-slate-700 hover:text-purple-700'}`}
            >
              Projects
            </Link>
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium ${pathname === '/dashboard' ? 'text-purple-700' : 'text-slate-700 hover:text-purple-700'}`}
            >
              My Dashboard
            </Link>
          </div>
        </nav>
        
        <div className="flex items-center justify-end flex-1">
          <div className="hidden md:flex items-center mr-10">
            <Link href="https://www.linkedin.com/company/otonomfund" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-[#9d00ff] font-bold text-sm">
              in
            </Link>
            <span className="mx-5 text-slate-800">/</span>
            <Link href="https://x.com/otonomfund" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-[#9d00ff] font-bold text-sm">
              X
            </Link>
            <span className="mx-5 text-slate-800">/</span>
            <Link href="https://github.com/Otonom-Launchpad" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-[#9d00ff] font-bold text-sm">
              Github
            </Link>
          </div>
          <div className="hidden sm:block">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden ml-4 p-2 rounded-md focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute w-full z-50">
          <div className="px-4 pt-2 pb-4 space-y-1 sm:px-6">
            <Link 
              href="/"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname === '/' || pathname === '/projects' ? 'text-purple-700' : 'text-slate-700 hover:text-purple-700'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Projects
            </Link>
            <Link 
              href="/dashboard"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname === '/dashboard' ? 'text-purple-700' : 'text-slate-700 hover:text-purple-700'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              My Dashboard
            </Link>
            <div className="flex justify-center px-3 py-5 mt-2 mb-2">
              <Link href="https://www.linkedin.com/company/otonomfund" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-[#9d00ff] font-bold text-sm">
                in
              </Link>
              <span className="mx-5 text-slate-800">/</span>
              <Link href="https://x.com/otonomfund" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-[#9d00ff] font-bold text-sm">
                X
              </Link>
              <span className="mx-5 text-slate-800">/</span>
              <Link href="https://github.com/Otonom-Launchpad" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-[#9d00ff] font-bold text-sm">
                Github
              </Link>
            </div>
            <div className="sm:hidden px-3 py-3 flex justify-center mt-1 mb-3">
              <ConnectButton compact={true} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}