import React from 'react';
import Link from 'next/link';

const ecosystemLinks = [
  { label: 'Home', href: 'https://www.goseismic.org/' },
  { label: 'Launchpad', href: 'https://www.goseismic.org/launchpad' },
  { label: 'Fund', href: 'https://www.goseismic.org/fund' },
  { label: 'Playbook', href: 'https://www.goseismic.org/post/conscious-systems' },
  { label: 'Research', href: 'https://www.goseismic.org/post/the-seismic-trifecta-why-ai-alignment-starts-with-consciousness' },
];

const resourceLinks = [
  { label: 'Download Invitation Whitepaper', href: 'https://www.goseismic.org/_files/ugd/89d297_22b56c0386724886b22cb55d06b4e163.pdf' },
  { label: 'Read Academic Paper (ConsciOS)', href: 'https://89d297ba-673a-455e-aea8-4f91b8fe9cb5.usrfiles.com/ugd/89d297_3a5a9aa1abee4bd68e4b5b5792cee8a2.pdf' },
  { label: "Visit Paper's Codebase (Github)", href: 'https://github.com/seismic-initiative/consciOS-academic-paper' },
  { label: 'Read The Playbook (Conscious Systems)', href: 'https://docs.google.com/document/d/1CrKev55KXbclgkEOKIeOzGTe7bXl_YzoIOyDO-FFYJw/edit?tab=t.7uwllkmjo1iz' },
];

export function Footer() {
  return (
    <footer className="bg-[#f5f5f5] pt-24 pb-10">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <img src="/images/seismic-logo.png" alt="Seismic" className="h-14 mb-6" style={{ marginLeft: '-11px' }} />
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-slate-900 mb-2">Build the Future</h4>
              <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                Seismic is an open ecosystem for builders creating a conscious civilization. We provide the blueprint, the community, and the funding. The work starts now.
              </p>
            </div>
            <div className="flex items-center">
              <Link href="https://x.com/sistemist" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-[#FA6906] font-bold text-sm">
                X
              </Link>
              <span className="mx-5 text-slate-800">/</span>
              <Link href="https://github.com/seismic-initiative" target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-[#FA6906] font-bold text-sm">
                Github
              </Link>
            </div>
          </div>

          <div className="md:col-span-4 mt-6 pl-4">
            <h4 className="font-semibold text-sm text-slate-900 mb-3">Ecosystem</h4>
            <ul className="space-y-[4px]">
              {ecosystemLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[#FA6906] text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 mt-6 pl-4">
            <h4 className="font-semibold text-sm text-slate-900 mb-3">Resources</h4>
            <ul className="space-y-[4px]">
              {resourceLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[#FA6906] text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <div className="mb-2 md:mb-0">&copy; {new Date().getFullYear()} Seismic &amp; Han Kay. All rights reserved.</div>
          <div className="flex space-x-4">
            <Link href="https://www.goseismic.org/privacy-policy" className="hover:text-[#FA6906] transition-colors" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
            <Link href="https://www.goseismic.org/terms-conditions" className="hover:text-[#FA6906] transition-colors" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}