'use client';

import Link from 'next/link';
import { Home, Package } from 'lucide-react';

export default function MerchantOrders() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-extrabold text-gray-900">Orders</h1>
      </header>

      <main className="flex-1 p-4">
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
           <Package size={48} className="mb-4 opacity-50" />
           <p className="font-medium text-gray-500">No past orders yet.</p>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white border-t border-gray-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          <Link href="/merchant" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
            <Home size={24} strokeWidth={2} />
            <span className="text-[10px] font-medium mt-1">Dashboard</span>
          </Link>
          <Link href="/merchant/orders" className="flex flex-col items-center text-green-600">
            <Package size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium mt-1">Orders</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
