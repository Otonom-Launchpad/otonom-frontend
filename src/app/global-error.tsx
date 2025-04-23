'use client';

import { Inter, Inter_Tight } from 'next/font/google';

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

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable}`}>
      <body className="antialiased font-sans bg-white">
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="text-center p-6">
            <h2 className="text-2xl font-bold mb-4">Critical Error</h2>
            <p className="mb-6">We apologize, but something went wrong with the application.</p>
            <button
              onClick={() => reset()}
              className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
