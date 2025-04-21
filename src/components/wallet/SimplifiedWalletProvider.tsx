'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getWalletAddress, setWalletAddress } from '@/utils/walletStorage';
import { safeLocalStorageGet, safeLocalStorageSet, safeLocalStorageRemove } from '@/utils/localStorage';

// Simplified wallet context type for hackathon demo
interface SimplifiedWalletContextType {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  balance: number;
  tier: number;
}

// Create the context with default values
const SimplifiedWalletContext = createContext<SimplifiedWalletContextType>({
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
  isConnecting: false,
  walletAddress: null,
  balance: 0,
  tier: 0
});

// Provider component
export function SimplifiedWalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(getWalletAddress());
  const [balance, setBalance] = useState(0);
  const [tier, setTier] = useState(0);

  // Check localStorage on mount to restore connection state
  useEffect(() => {
    const savedState = safeLocalStorageGet('hackathonWalletState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setIsConnected(state.isConnected);
        setWalletAddress(state.walletAddress);
        setBalance(state.balance);
        setTier(state.tier);
      } catch (e) {
        console.error('Error parsing saved wallet state:', e);
      }
    }
  }, []);

  // Save state 
  useEffect(() => {
    setWalletAddress(walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    if (isConnected && walletAddress) {
      safeLocalStorageSet('hackathonWalletState', JSON.stringify({
        isConnected,
        walletAddress,
        balance,
        tier
      }));
    } else if (!isConnected) {
      safeLocalStorageRemove('hackathonWalletState');
    }
  }, [isConnected, walletAddress, balance, tier]);

  // Mock connect function for hackathon demo
  const connect = async () => {
    setIsConnecting(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock wallet connection data
    const randomAddress = '6FPdTxHN4rT7Tb' + Math.random().toString(16).substring(2, 10);
    setWalletAddress(randomAddress);
    setBalance(1500);  // Default OFUND balance
    setTier(1);        // Default tier for hackathon demo
    setIsConnected(true);
    setIsConnecting(false);
    
    // Dispatch event for UI components
    document.dispatchEvent(new CustomEvent('wallet-connected'));
  };

  // Disconnect function
  const disconnect = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setBalance(0);
    setTier(0);
    localStorage.removeItem('hackathonWalletState');
  };

  return (
    <SimplifiedWalletContext.Provider
      value={{
        connect,
        disconnect,
        isConnected,
        isConnecting,
        walletAddress,
        balance,
        tier
      }}
    >
      {children}
    </SimplifiedWalletContext.Provider>
  );
}

// Custom hook to use the wallet context
export function useSimplifiedWallet() {
  return useContext(SimplifiedWalletContext);
}
