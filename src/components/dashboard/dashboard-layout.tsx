'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  LayoutDashboard, 
  Wallet, 
  LineChart, 
  Settings, 
  User,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomWalletModal } from '@/components/wallet/CustomWalletModalProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const wallet = useWallet();
  const router = useRouter();
  const { setVisible } = useCustomWalletModal();

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/investments', label: 'Investments', icon: LineChart },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];
  
  return (
    <MainLayout>
      <div className="pt-20">
        <div className="bg-gray-100">
          <div className="container mx-auto px-4 py-6 pb-24 lg:pb-32">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left sidebar - as a normal card */}
          <div className="lg:col-span-3 col-span-1">
            <div className="rounded-xl bg-black text-white shadow-lg p-6 mb-6 lg:h-full">
              {/* Profile section */}
              <div className="mb-8">
                <h2 className="flex items-center text-xl font-semibold mb-6">
                  <User size={20} className="mr-2" />
                  <span>Profile</span>
                </h2>
                
                {wallet.connected && wallet.publicKey ? (
                  <div className="rounded-lg bg-gray-800 p-4">
                    <p className="mb-1 text-sm text-gray-400">Connected as</p>
                    <p className="mb-3 truncate font-medium">
                      {`${wallet.publicKey.toString().slice(0, 6)}...${wallet.publicKey.toString().slice(-4)}`}
                    </p>
                    <p className="mb-1 text-xs text-gray-400">Tier Level</p>
                    <p className="mb-3 text-sm font-medium text-purple-400">Tier 3</p>
                    <p className="mb-1 text-xs text-gray-400">$OFUND Balance</p>
                    <p className="text-sm font-medium">100,000</p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-800 p-4">
                    <div className="flex items-center mb-4 text-yellow-400">
                      <AlertCircle size={16} className="mr-2" />
                      <p className="text-sm">Wallet Not Connected</p>
                    </div>
                    <p className="text-sm mb-4">Connect your wallet to view your dashboard</p>
                    <Button 
                      onClick={() => setVisible(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                    >
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Navigation */}
              <nav className="space-y-1 mb-8">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Navigation</h3>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-primary text-white' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              
              {/* Disconnect button */}
              <button 
                className="flex w-full items-center justify-center rounded-full bg-white py-2.5 px-4 text-sm font-medium text-black hover:bg-gray-100 shadow-md transition duration-300 hover:shadow-lg"
                onClick={() => {
                  // Disconnect the wallet
                  wallet.disconnect();
                  
                  // Clear any stored state
                  localStorage.removeItem('walletButtonState');
                  localStorage.removeItem('walletAddress');
                  
                  // Redirect to home page
                  router.push('/');
                }}
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-9 col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              {children}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}
