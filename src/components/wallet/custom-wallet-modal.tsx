import React from 'react';
import { WalletModalProps, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import Image from 'next/image';

export const CustomWalletModal: React.FC<WalletModalProps> = ({
  className = '',
  container = 'body',
  ...props
}) => {
  const { wallets, select } = useWallet();
  const { setVisible } = useWalletModal();

  const handlePhantomClick = () => {
    // Find the Phantom wallet adapter
    const phantomWallet = wallets.find(
      (wallet) => 
        wallet.adapter.name === 'Phantom' && 
        wallet.readyState === WalletReadyState.Installed
    );
    
    if (phantomWallet) {
      select(phantomWallet.adapter.name);
      setVisible(false);
    }
  };

  return (
    <div className="wallet-adapter-modal-wrapper">
      <div className="wallet-adapter-modal-content">
        <button 
          className="wallet-adapter-modal-button-close" 
          onClick={() => setVisible(false)}
        >
          ×
        </button>
        <h1 className="wallet-adapter-modal-title">Connect your wallet to continue</h1>
        
        <ul className="wallet-adapter-modal-list">
          <li>
            <button 
              className="wallet-adapter-button wallet-adapter-button-phantom"
              onClick={handlePhantomClick}
            >
              <Image 
                src="/images/phantom-logo.svg" 
                alt="Phantom" 
                width={24} 
                height={24} 
              />
              Phantom
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CustomWalletModal;
