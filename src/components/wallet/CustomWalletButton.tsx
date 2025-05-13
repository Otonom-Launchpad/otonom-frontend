import React, { FC, MouseEventHandler, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCustomWalletModal } from './CustomWalletModalProvider';
import { useAuth } from '@/hooks/useAuth';

interface CustomWalletButtonProps {
  className?: string;
  compact?: boolean;
}

export const CustomWalletButton: FC<CustomWalletButtonProps> = ({ 
  className = '',
  compact = false 
}) => {
  const { connected, disconnect } = useWallet();
  const { setVisible } = useCustomWalletModal();
  const { disconnectWallet, loading } = useAuth();

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      if (connected) {
        try {
          await disconnectWallet();
        } catch (e) {
          console.error("Error disconnecting:", e);
        }
      } else {
        setVisible(true);
      }
    },
    [connected, disconnectWallet, setVisible]
  );

  // Simplify button text logic
  const buttonText = loading 
    ? 'Processing...' 
    : connected 
    ? 'Disconnect' 
    : (compact ? 'Connect' : 'Connect Wallet');

  return (
    <button
      className={`wallet-adapter-button whitespace-nowrap ${className} ${loading ? 'opacity-80' : ''}`}
      onClick={handleClick}
      disabled={loading}
      style={{
        backgroundColor: 'black',
        borderRadius: '9999px',
        padding: '0.4rem 1.6rem',
        fontFamily: 'var(--font-inter-tight)',
        fontWeight: 500,
        fontSize: '14px',
        lineHeight: '20px',
        color: 'white',
        border: 'none',
        cursor: loading ? 'wait' : 'pointer',
        minWidth: '160px',
        height: '40px',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {buttonText}
    </button>
  );
};

export default CustomWalletButton;
