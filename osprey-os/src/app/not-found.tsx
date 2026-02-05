'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to dashboard after a brief moment
    const timeout = setTimeout(() => {
      router.push('/dashboard');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-slate-500 mb-8">Redirecting you to the dashboard...</p>
      <button
        onClick={() => router.push('/dashboard')}
        className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
      >
        Go to Dashboard Now
      </button>
    </div>
  );
}
