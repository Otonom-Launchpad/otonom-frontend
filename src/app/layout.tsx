import type { Metadata } from "next";
import { Inter, Inter_Tight } from 'next/font/google';
import { Providers } from "./providers";
import { Toaster } from "sonner";

// Import styles
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

export const metadata: Metadata = {
  title: "Otonom Fund",
  description: "AI-powered launchpad for funding next-gen AI ventures",
};

// Initialize the Inter font
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

// Initialize the Inter Tight font
const interTight = Inter_Tight({
  subsets: ['latin'], 
  display: 'swap',
  variable: '--font-inter-tight',
  weight: ['400', '500', '600', '700']
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable}`}>
      <body className="antialiased font-sans bg-white">
        <Providers>
          {children}
          <Toaster richColors closeButton position="bottom-right" /> 
        </Providers>
      </body>
    </html>
  );
}