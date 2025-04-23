'use client';

import React, { FC, ReactNode, useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import Image from 'next/image';
import './wallet-modal.css';

interface CustomWalletModalProviderProps {
  children: ReactNode;
}

interface CustomWalletModalContextState {
  visible: boolean;
  setVisible: (open: boolean) => void;
}

export const CustomWalletModalContext = React.createContext<CustomWalletModalContextState>({
  visible: false,
  setVisible: () => {},
});

export const CustomWalletModalProvider: FC<CustomWalletModalProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [portal, setPortal] = useState<Element | null>(null);

  // Create the modal portal when the component mounts
  React.useEffect(() => {
    const body = document.querySelector('body');
    if (body) {
      setPortal(body);
    }
  }, []);

  // Handle fade in/out animations
  React.useEffect(() => {
    if (visible) {
      setTimeout(() => setFadeIn(true), 0);
    } else {
      setFadeIn(false);
    }
  }, [visible]);

  const hideModal = useCallback(() => {
    setFadeIn(false);
    setTimeout(() => {
      setVisible(false);
      // Dispatch a custom event when modal is closed
      document.dispatchEvent(new CustomEvent('wallet-modal-closed'));
    }, 150);
  }, []);

  return (
    <CustomWalletModalContext.Provider
      value={{
        visible,
        setVisible,
      }}
    >
      {children}
      {portal &&
        visible &&
        createPortal(
          <CustomWalletModal visible={fadeIn} onClose={hideModal} />,
          portal
        )}
    </CustomWalletModalContext.Provider>
  );
};

// Hook to use the wallet modal context
export const useCustomWalletModal = () => React.useContext(CustomWalletModalContext);

// The actual modal component
const CustomWalletModal: FC<{ visible: boolean; onClose: () => void }> = ({ 
  visible, 
  onClose 
}) => {
  const { wallets, select } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal visibility changes
  useEffect(() => {
    if (!visible) {
      setSelectedWallet(null);
      setConnecting(false);
      setError(null);
    }
  }, [visible]);

  const handleWalletClick = (wallet: typeof wallets[number]) => {
    try {
      setSelectedWallet(wallet.adapter.name);
      setConnecting(true);
      setError(null);
      
      // Connect to the wallet
      select(wallet.adapter.name);
      
      // For wallets that are already connected, we can close immediately
      if (wallet.adapter.connected) {
        onClose();
        return;
      }
      
      // For wallets in a ready state, we should give them time to connect
      if (wallet.readyState === WalletReadyState.Installed || 
          wallet.readyState === WalletReadyState.Loadable) {
        // The wallet adapter will handle the connection
        // We'll close the modal to let the user interact with their wallet
        setTimeout(() => {
          onClose();
        }, 300);
      } else {
        // For wallets that need installation or are otherwise not ready
        setTimeout(() => {
          setConnecting(false);
          onClose();
        }, 600);
      }
    } catch (err) {
      console.error('Error selecting wallet:', err);
      setError(`Could not connect to ${wallet.adapter.name}. Please try again.`);
      setConnecting(false);
    }
  };

  // Find the Phantom wallet
  const phantomWallet = wallets.find(
    (wallet) => wallet.adapter.name === 'Phantom'
  );

  return (
    <div className={`wallet-adapter-modal ${visible ? 'wallet-adapter-modal-fade-in' : ''}`} onClick={onClose}>
      <div className="wallet-adapter-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="wallet-adapter-modal-button-close"
        >
          ×
        </button>
        
        <h1 className="wallet-adapter-modal-title">Connect a wallet to continue</h1>
        
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="wallet-adapter-modal-list">
          {phantomWallet ? (
            <button 
              onClick={() => handleWalletClick(phantomWallet)}
              className={`wallet-adapter-modal-list-item ${connecting && selectedWallet === 'Phantom' ? 'opacity-70' : ''}`}
              disabled={connecting}
            >
              <Image
                src="/assets/wallets/phantom.svg"
                width={28}
                height={28}
                alt="Phantom"
              />
              <div className="wallet-adapter-modal-list-item-name">
                {connecting && selectedWallet === 'Phantom' ? 'Connecting...' : 'Phantom'}
              </div>
              {connecting && selectedWallet === 'Phantom' && (
                <div className="ml-2 animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              )}
            </button>
          ) : (
            <a
              href="https://phantom.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="wallet-adapter-modal-list-item"
            >
              <Image
                src="/assets/wallets/phantom.svg"
                width={28}
                height={28}
                alt="Phantom"
              />
              <div className="wallet-adapter-modal-list-item-name">
                Phantom (Install)
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomWalletModalProvider;
