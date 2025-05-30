import React from 'react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="h-screen w-full overflow-hidden bg-white flex flex-col items-center">
      {/* Header spacing */}
      <div className="h-24"></div>
      
      {/* Main content - properly spaced within hero section */}
      <div className="container px-4 md:px-6 mx-auto relative z-10 flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Main heading */}
          
          <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl md:text-6xl mb-6">
            Next Generation of
            <div><span className="text-[#9d00ff]">AI Venture Funding</span></div>
          </h1>
          
          <p className="text-[#707E89] max-w-[600px] mx-auto mb-12 text-[20px] font-semibold font-heading leading-[1.1em]">
            Otonom Fund connects breakthrough <span className="text-[#23272F]">AI projects</span><br />
            with community funding, powered by blockchain.
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
              <div className="text-3xl font-bold font-heading text-[#9d00ff]">$2.8M+</div>
              <div className="text-sm text-slate-600">Total Funded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-heading text-[#9d00ff]">18</div>
              <div className="text-sm text-slate-600">Projects Launched</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-heading text-[#9d00ff]">4,200+</div>
              <div className="text-sm text-slate-600">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-heading text-[#9d00ff]">92%</div>
              <div className="text-sm text-slate-600">Successful Projects</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}