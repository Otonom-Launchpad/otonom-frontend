'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { WalletAuthButton } from '@/components/ui/wallet-auth-button';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Wallet, 
  LineChart, 
  Settings, 
  Menu,
  X,
  User
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/investments', label: 'Investments', icon: LineChart },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  return (
    <MainLayout>
      {/* Mobile Sidebar Toggle - only visible on mobile */}
      <button 
        onClick={toggleSidebar}
        className="fixed right-4 top-24 z-30 rounded-full bg-primary p-2 text-white shadow-lg lg:hidden"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="mx-auto flex w-full max-w-screen-2xl pt-20">
        {/* Left Sidebar - black */}
        <aside 
          className={`fixed inset-y-0 left-0 z-20 mt-20 flex h-[calc(100vh-80px)] w-64 flex-col rounded-r-xl bg-black px-4 py-8 text-white shadow-lg transition-transform lg:relative lg:mt-8 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="flex items-center text-xl font-semibold text-white">
              <User size={20} className="mr-2" />
              <span>Profile</span>
            </h2>
          </div>

          {/* User Card */}
          <div className="mb-8 rounded-lg bg-gray-800 p-4">
            <p className="mb-1 text-sm text-gray-400">Connected as</p>
            <p className="mb-3 truncate font-medium text-white">
              {user?.display_name || (user?.wallet_address ? user?.wallet_address?.slice(0, 6) + '...' + user?.wallet_address?.slice(-4) : '5KRwas...utQY')}
            </p>
            {user?.tier !== undefined && (
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">Tier Level</span>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                  Tier {user?.tier || 0}
                </span>
              </div>
            )}
            {user?.ofund_balance !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">$OFUND Balance</span>
                <span className="font-medium text-white">{user?.ofund_balance?.toLocaleString() || 0}</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
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
          
          <div className="mt-auto"></div>
        </aside>

        {/* Main Content - white, taking remaining space */}
        <main className="mt-8 w-full bg-gray-50 px-4 lg:mt-8 lg:w-[calc(100%-256px)]">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            {children}
          </div>
        </main>
      </div>

      {/* Fixed Button at Bottom */}
      <div className="fixed bottom-8 left-4 z-30 w-56 lg:left-4">
        <button className="flex w-full items-center justify-center rounded-full bg-white py-2.5 px-4 text-sm font-medium text-black hover:bg-gray-100">
          Disconnect Wallet
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black/20 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}
    </MainLayout>
  );
}
