'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';

export default function NotFound() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="mb-8 text-gray-600 max-w-lg">
          We couldn't find the page you're looking for. The page might have been moved, deleted, or may be temporarily unavailable.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </MainLayout>
  );
}
