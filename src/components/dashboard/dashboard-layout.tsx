'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Wallet, 
  LineChart, 
  Settings, 
  User
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();

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
                
                <div className="rounded-lg bg-gray-800 p-4">
                  <p className="mb-1 text-sm text-gray-400">Connected as</p>
                  <p className="mb-3 truncate font-medium">
                    {user?.wallet_address ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}` : '5KRwas...utQY'}
                  </p>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Tier Level</span>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                      Tier {user?.tier || 2}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">$OFUND Balance</span>
                    <span className="font-medium">{user?.ofund_balance?.toLocaleString() || '12,500'}</span>
                  </div>
                </div>
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
              <button className="flex w-full items-center justify-center rounded-full bg-white py-2.5 px-4 text-sm font-medium text-black hover:bg-gray-100 shadow-md transition duration-300 hover:shadow-lg">
                Disconnect Wallet
              </button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-9 col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-md">
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
