'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has completed onboarding (e.g., in localStorage)
    const hasOnboarded = localStorage.getItem('kijiko-onboarded');

    if (hasOnboarded) {
      router.replace('/home');
    } else {
      router.replace('/onboarding');
    }
  }, [router]);

  // Return empty or loading state while deciding
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
