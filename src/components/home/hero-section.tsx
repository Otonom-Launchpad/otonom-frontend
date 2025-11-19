import React from 'react';
import { Button } from '@/components/ui/button';

import { AlertTriangle } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="h-screen w-full overflow-hidden bg-white flex flex-col items-center">
      {/* Header spacing */}
      <div className="h-24"></div>
      
      {/* Main content - properly spaced within hero section */}
      <div className="container px-4 md:px-6 mx-auto relative z-10 flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Warning Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AlertTriangle className="w-4 h-4" />
            <span>Working demo MVP built on Solana — Content is dummy</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl md:text-6xl mb-6">
            Fund The
            <div><span className="text-[#FA6906]">Conscious Future</span></div>
          </h1>
          
          <p className="text-[#707E89] max-w-[600px] mx-auto mb-12 text-[20px] font-semibold font-heading leading-[1.4em]">
            Community funding for systems-level builders.<br />
            <span className="text-[#23272F]">Transparent. Decentralized. Regenerative.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button disabled size="lg" className="bg-black hover:bg-black/80 rounded-full text-white px-10 py-3 w-full sm:w-[220px] disabled:opacity-100 cursor-not-allowed">
              Explore Projects
            </Button>
            <Button disabled size="lg" variant="outline" className="rounded-full border-slate-200 text-black hover:border-gray-50 hover:bg-gray-50 hover:text-black px-10 py-3 w-full sm:w-[220px] disabled:opacity-100 cursor-not-allowed transition-colors">
              Submit Your Project
            </Button>
          </div>
          
          {/* Stats section moved inside hero as requested */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl w-full">
            <div className="text-center">
              <div className="text-3xl font-bold font-heading text-[#FA6906]">$2.8M+</div>
              <div className="text-sm text-slate-600">Total Funded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-heading text-[#FA6906]">18</div>
              <div className="text-sm text-slate-600">Projects Launched</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-heading text-[#FA6906]">4,200+</div>
              <div className="text-sm text-slate-600">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-heading text-[#FA6906]">92%</div>
              <div className="text-sm text-slate-600">Successful Projects</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}