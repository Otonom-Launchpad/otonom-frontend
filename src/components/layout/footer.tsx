import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 pt-24 pb-8">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <img src="/images/Otonom Logo.svg" alt="Otonom Fund" className="h-10 mb-6" />
            <p className="text-slate-600 mb-6 max-w-xs text-sm">
              A decentralized launchpad connecting breakthrough AI projects with community funding, powered by blockchain technology.
            </p>
            <div className="flex items-center mb-6">
              <Link href="https://www.linkedin.com/company/otonomfund" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-[#9d00ff] font-bold text-sm">
                in
              </Link>
              <span className="mx-5 text-slate-800">/</span>
              <Link href="https://x.com/otonomfund" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-[#9d00ff] font-bold text-sm">
                X
              </Link>
              <span className="mx-5 text-slate-800">/</span>
              <Link href="https://github.com/Otonom-Launchpad" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-[#9d00ff] font-bold text-sm">
                Github
              </Link>
            </div>
          </div>
          
          <div className="md:col-span-4 md:flex md:justify-center">
            <div>
              <h4 className="font-medium text-sm uppercase text-slate-900 mb-4">PLATFORM</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="https://www.otonom.fund/" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[#9d00ff] text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="https://www.otonom.fund/ai-startup-school" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[#9d00ff] text-sm">
                    AI Startup School
                  </Link>
                </li>
                <li>
                  <Link href="https://www.otonom.fund/spaghetti-startup-book-by-han-kay" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[#9d00ff] text-sm">
                    Textbook: Spaghetti Startup
                  </Link>
                </li>
                <li>
                  <Link href="https://www.otonom.fund/pitch-deck-litepaper" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[#9d00ff] text-sm">
                    Pitch Deck / Litepaper
                  </Link>
                </li>
                <li>
                  <Link href="https://www.otonom.fund/ai-catalyst-blog" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[#9d00ff] text-sm">
                    AI Catalyst Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <h4 className="font-medium text-sm uppercase text-slate-900 mb-4">INVESTORS</h4>
            <p className="text-slate-600 text-sm mb-4">
              We're pioneering an AI-augmented venture platform with a lean operational model. For investment opportunities and partnerships, review our
              <Link href="https://www.otonom.fund/pitch-deck-litepaper" target="_blank" rel="noopener noreferrer" className="text-[#9d00ff] hover:underline mx-1">Pitch Deck / Litepaper</Link>
              and connect with us on
              <Link href="https://www.crunchbase.com/organization/otonom-4582" target="_blank" rel="noopener noreferrer" className="text-[#9d00ff] hover:underline ml-1">Crunchbase</Link>.
            </p>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <div className="mb-2 md:mb-0">&copy; {new Date().getFullYear()} Otonom Fund. All rights reserved.</div>
          <div className="flex space-x-4">
            <Link href="/privacy-policy" className="hover:underline text-slate-500">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline text-slate-500">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}