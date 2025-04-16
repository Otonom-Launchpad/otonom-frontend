import React, { FC, MouseEventHandler, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCustomWalletModal } from './CustomWalletModalProvider';

interface CustomWalletButtonProps {
  className?: string;
  compact?: boolean;
}

export const CustomWalletButton: FC<CustomWalletButtonProps> = ({ 
  className = '',
  compact = false 
}) => {
  const { connected, publicKey, wallet, disconnect } = useWallet();
  const { setVisible } = useCustomWalletModal();

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (connected) {
        disconnect();
      } else {
        setVisible(true);
      }
    },
    [connected, disconnect, setVisible]
  );

  // Format the wallet address to show only the first and last 4 characters
  const formattedAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : '';

  const buttonText = connected 
    ? formattedAddress 
    : compact ? 'Connect' : 'Connect Wallet';

  return (
    <button
      className={`wallet-adapter-button whitespace-nowrap ${className}`}
      onClick={handleClick}
      style={{
        backgroundColor: 'black',
        borderRadius: '9999px',
        padding: '0.4rem 1.6rem',
        fontFamily: 'var(--font-inter-tight)',
        fontWeight: 500, // Keeping at 500 as requested
        fontSize: '14px',
        lineHeight: '20px', // Reduced line height as requested
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        minWidth: '160px',
        height: '40px', // Fixed height to match Explore Projects button
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
      {connected ? formattedAddress : 'Connect Wallet'}
    </button>
  );
};

export default CustomWalletButton;
