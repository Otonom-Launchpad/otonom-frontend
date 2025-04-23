'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { useWallet } from '@solana/wallet-adapter-react';
import { getUserData } from '@/services/token-service';

export default function DashboardPage() {
  // Define the user type to match the DashboardOverview props
  type UserType = {
    id: string;
    wallet_address: string;
    tier: number;
    ofund_balance: number;
    display_name?: string;
  } | null;
  
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);
  const wallet = useWallet();
  const router = useRouter();

  // Check wallet connection and fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        if (wallet.connected && wallet.publicKey) {
          // Get real wallet data from the blockchain
          const userData = await getUserData(wallet);
          setUser(userData);
          setLoading(false);
        } else if (!wallet.connecting) {
          // Not connected and not in process of connecting
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    }

    fetchUserData();
  }, [wallet.connected, wallet.connecting, wallet.publicKey]);

  // Don't redirect, let the dashboard handle non-connected state with overlay
  // This allows users to see the dashboard when not connected, but with the overlay
  // We removed the redirect to ensure better UX when clicking from homepage

  // Show loading state
  if (loading || wallet.connecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        <span className="ml-2">Loading your dashboard...</span>
      </div>
    );
  }

  // Always render dashboard - let the component handle the empty/loading states
  // This ensures proper navigation and UI experience for the user
  // We don't use a redirect so user can see the Connect Wallet prompt

  return (
    <DashboardLayout>
      <DashboardOverview user={user} />
    </DashboardLayout>
  );
}
