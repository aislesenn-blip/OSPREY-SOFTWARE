'use client';

import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export default function Profile() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold text-gray-900">Profile</h1>
      </header>
      <main className="flex-1 p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Link href="/merchant" className="block px-4 py-4 hover:bg-gray-50 border-b border-gray-100 font-medium text-gray-700">
            Switch to Merchant View
          </Link>
          <Link href="/settings" className="block px-4 py-4 hover:bg-gray-50 border-b border-gray-100 font-medium text-gray-700">
            Settings
          </Link>
          <div className="px-4 py-4 hover:bg-gray-50 font-medium text-red-600">
            Log Out
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
