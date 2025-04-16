import React from 'react';

interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <span className="text-xl font-bold">{number}</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="mt-2 text-slate-600 max-w-[600px] mx-auto">
            Join the Otonom Fund community and start investing in AI projects in just a few simple steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Step 
            number={1} 
            title="Connect Wallet" 
            description="Connect your Solana wallet to get started with Otonom Fund."
          />
          <Step 
            number={2} 
            title="Choose Tier" 
            description="Select your investment tier based on your $OFUND holdings."
          />
          <Step 
            number={3} 
            title="Invest in Projects" 
            description="Browse and invest in curated AI projects that match your interests."
          />
        </div>
      </div>
    </section>
  );
}