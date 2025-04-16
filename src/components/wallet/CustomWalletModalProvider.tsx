import React, { FC, ReactNode, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import Image from 'next/image';

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
    setTimeout(() => setVisible(false), 150);
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

  const handleWalletClick = (wallet: typeof wallets[number]) => {
    select(wallet.adapter.name);
    onClose();
  };

  // Find the Phantom wallet
  const phantomWallet = wallets.find(
    (wallet) => wallet.adapter.name === 'Phantom'
  );

  return (
    <div 
      className={`wallet-adapter-modal ${visible ? 'wallet-adapter-modal-fade-in' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.5)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 150ms ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div 
        className="wallet-adapter-modal-wrapper"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          maxWidth: '400px',
          borderRadius: '10px',
          backgroundColor: '#000000',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
          fontFamily: 'var(--font-inter-tight)',
          padding: '20px',
          flex: 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: '18px',
            right: '18px',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            padding: 0,
          }}
        >
          ×
        </button>
        
        <h1 
          style={{
            fontWeight: 600,
            fontSize: '24px',
            lineHeight: '36px',
            margin: 0,
            padding: '90px 40px 30px',
            textAlign: 'center',
            color: '#fff',
          }}
        >
          Connect your wallet to continue
        </h1>
        
        <div style={{ width: '100%', padding: '0 20px', marginBottom: '50px' }}>
          {phantomWallet && (
            <button 
              onClick={() => phantomWallet && handleWalletClick(phantomWallet)}
              style={{
                width: '50%',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 20px',
                backgroundColor: '#9d00ff',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontFamily: 'var(--font-inter-tight)',
                fontWeight: 600,
                fontSize: '16px',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', left: '16px' }}>
                <Image 
                  src="/images/phantom-logo.svg" 
                  alt="Phantom" 
                  width={24} 
                  height={24} 
                />
              </div>
              <span style={{ 
                display: 'inline-block', 
                width: 'calc(100% - 24px)', 
                marginLeft: '20px',
                textAlign: 'center' 
              }}>
                Phantom
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomWalletModalProvider;
