'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Wallet, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCustomWalletModal } from '@/components/wallet/CustomWalletModalProvider';
import { InvestmentsList } from '@/components/dashboard/investments-list';
import { getUserInvestments } from '@/services/investment-service';

// Mock data no longer needed - using real on-chain data

interface DashboardOverviewProps {
  user: {
    id: string;
    wallet_address: string;
    tier: number;
    ofund_balance: number;
    display_name?: string;
  } | null;
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
  const wallet = useWallet();
  const { setVisible } = useCustomWalletModal();
  
  // Ensure we have stable values even if wallet is not defined
  const isConnected = wallet && wallet.connected && wallet.publicKey;
  
  // For consistency in the hackathon demo, always show Tier 3 and 100,000 OFUND
  const ofundBalance = 100000;
  const userTier = 3;
  
  // Investment portfolio values based on actual blockchain investments
  const [investments, setInvestments] = useState<Array<{ projectName: string, amount: number, timestamp: number }>>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate portfolio values based on actual investments
  // For the hackathon demo, we're showing a 2x return on investments
  const totalValue = totalInvested * 2; // Simulated 2x return for the demo
  const totalROI = totalInvested > 0 ? 100 : 0; // 100% ROI for demo if any investments exist
  
  // Fetch REAL on-chain investments from Solana blockchain
  useEffect(() => {
    if (!wallet.connected || !wallet.publicKey) return;
    
    const fetchRealInvestments = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching REAL on-chain investments for dashboard...');
        const userInvestments = await getUserInvestments(wallet);
        console.log('Fetched blockchain investments:', userInvestments);
        
        // Convert timestamp strings to numbers if needed
        const processedInvestments = userInvestments.map(inv => ({
          ...inv,
          timestamp: typeof inv.timestamp === 'string' ? new Date(inv.timestamp).getTime() : inv.timestamp
        }));
        
        setInvestments(processedInvestments);
        
        // Calculate total invested amount from actual on-chain investments
        const total = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
        console.log(`Total invested on blockchain: $${total}`);
        setTotalInvested(total);
      } catch (error) {
        console.error('Error fetching blockchain investments for dashboard:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRealInvestments();
    
    // Refresh blockchain data every 15 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      fetchRealInvestments();
    }, 15000);
    
    return () => clearInterval(refreshInterval);
  }, [wallet.connected, wallet.publicKey]);

  return (
    <div className="space-y-8 relative">
      {/* Overlay when wallet is not connected */}
      {!isConnected && (
        <div className="absolute inset-0 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Wallet Not Connected</h3>
            <p className="text-gray-600 mb-6">Connect your wallet to view your investment dashboard and portfolio.</p>
            <Button 
              onClick={() => setVisible(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white w-full rounded-full"
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back, {isConnected && wallet.publicKey 
            ? `${wallet.publicKey.toString().slice(0, 6)}...${wallet.publicKey.toString().slice(-4)}` 
            : 'Investor'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Invested */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Invested</p>
              <h3 className="mt-1 text-2xl font-bold">${totalInvested.toLocaleString()}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Wallet size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm font-medium text-primary">On-chain investments</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Portfolio Value</p>
              <h3 className="mt-1 text-2xl font-bold">${totalValue.toLocaleString()}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <span className={`flex items-center text-sm font-medium ${totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp size={16} className="mr-1" />
              ${(totalValue - totalInvested).toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">total profit/loss</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Your Tier Level</p>
              <h3 className="mt-1 text-2xl font-bold">Tier {userTier}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <span className="flex items-center text-sm font-medium text-primary">
              {ofundBalance.toLocaleString()} $OFUND
            </span>
            <span className="text-sm text-gray-500">token balance</span>
          </div>
        </div>
      </div>

      {/* On-chain Investments */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Investments</h2>
          <p className="text-sm text-gray-500">Real-time investment data from Solana blockchain</p>
        </div>
        
        {/* Investments list component with on-chain data */}
        <InvestmentsList />
      </div>
    </div>
  );
}
