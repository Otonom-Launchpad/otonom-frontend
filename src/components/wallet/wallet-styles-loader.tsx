'use client';

// This component dynamically loads wallet adapter styles to avoid SSR issues
import { useEffect } from 'react';

// We need to directly import the styles to make TypeScript happy
// This is still safe for SSR because we're using 'use client' directive
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletStylesLoader = () => {
  // We're no longer dynamically importing inside useEffect, as that was causing TS errors
  // Instead, we're using the 'use client' directive to ensure the styles are only loaded on the client
  return null;
};

export default WalletStylesLoader;
