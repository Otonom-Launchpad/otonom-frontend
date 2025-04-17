import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-start overflow-hidden bg-gradient-to-b from-gray-50 to-white pb-20">
      
      {/* Explicit header spacing */}
      <div className="h-20"></div> {/* Equal to header height */}
      
      {/* Extra top spacing */}
      <div className="h-32 md:h-48 lg:h-64"></div>
      
      {/* Main content */}
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Topline removed as requested */}
          
          <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl md:text-6xl mb-6">
            Next Generation of
            <div><span className="text-[#9d00ff]">AI Venture Funding</span></div>
          </h1>
          
          <p className="text-[#707E89] max-w-[600px] mx-auto mb-12 text-[20px] font-semibold font-heading leading-[1.1em]">
            Otonom Fund connects breakthrough <span className="text-[#23272F]">AI projects</span><br />
            with community funding, powered by blockchain.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects" className="w-full sm:w-auto">
              <Button size="lg" className="bg-black hover:bg-black/80 rounded-full text-white px-10 py-3 w-full sm:w-[220px]">
                Explore Projects
              </Button>
            </Link>
            <Link href="/submit" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="rounded-full border-slate-200 text-black hover:border-gray-50 hover:bg-gray-50 hover:text-black px-10 py-3 w-full sm:w-[220px] transition-colors">
                Submit Your Project
              </Button>
            </Link>
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