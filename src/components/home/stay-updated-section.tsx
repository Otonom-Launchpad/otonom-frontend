import React from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { CustomWalletButton } from '@/components/wallet/CustomWalletButton';

export function StayUpdatedSection() {
  const { connected } = useWallet();
  
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-[#9d00ff]/5 to-purple-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold tracking-tight font-heading mb-4">
            {connected ? 'You\'re Connected!' : 'Ready to invest?'}
          </h2>
          <p className="text-slate-600 mb-8">
            {connected
              ? 'You can now invest in AI projects, track your investments, and participate in the Otonom ecosystem.'
              : 'Connect your Solana wallet to start investing in breakthrough AI projects and be part of the future of innovation.'}
          </p>
          
          <div className="flex justify-center mb-8">
            {connected ? (
              <Button 
                className="bg-black hover:bg-black/80 text-white rounded-full px-10 py-3"
                onClick={() => window.location.href = '/dashboard'}
              >
                View Dashboard
              </Button>
            ) : (
              <div className="flex justify-center">
                <CustomWalletButton />
              </div>
            )}
          </div>
          
          <p className="text-sm text-slate-500 mt-4">
            Otonom Fund uses Solana blockchain for secure and transparent investments. <br />
            New to crypto? <a href="/faq" className="text-[#9d00ff] hover:underline">Learn how to set up your wallet</a>.
          </p>
        </div>
      </div>
    </section>
  );
}