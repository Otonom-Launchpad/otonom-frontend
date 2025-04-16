import React from 'react';
import type { Metadata } from "next";
import "./globals.css";
import "./wallet-modal-override.css";
import { Providers } from "./providers";
import { Inter, Inter_Tight } from 'next/font/google';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable}`}>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}