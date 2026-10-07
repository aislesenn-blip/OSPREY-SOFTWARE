'use client';

import Link from 'next/link';
import { PlusCircle, TrendingUp, Package, Home } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function MerchantDashboard() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{t('merchantDashboard')}</h1>
          <p className="text-sm text-gray-500 font-medium">Mambo Restaurant</p>
        </div>
        <Link href="/profile" className="text-sm text-gray-500 underline font-medium">Switch to Customer</Link>
      </header>

      <main className="flex-1 p-4">
        {/* Quick Actions */}
        <Link
          href="/merchant/create"
          className="flex items-center justify-center space-x-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 mb-6 transition-transform active:scale-[0.98]"
        >
          <PlusCircle size={20} />
          <span>{t('createListing')}</span>
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center text-gray-500 mb-2">
              <Package size={16} className="mr-1" />
              <span className="text-xs font-bold uppercase tracking-wide">Active Listings</span>
            </div>
            <p className="text-2xl font-black text-gray-900">3</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center text-gray-500 mb-2">
              <TrendingUp size={16} className="mr-1" />
              <span className="text-xs font-bold uppercase tracking-wide">Recovered (Today)</span>
            </div>
            <p className="text-2xl font-black text-green-700">TZS 15K</p>
          </div>
        </div>

        {/* Recent Orders */}
        <h2 className="font-bold text-gray-900 mb-4">Pending Pickups</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-3">
             <div>
               <p className="font-bold text-gray-900">Chicken & Chips</p>
               <p className="text-xs text-gray-500 font-medium">Pickup: 18:30 - 19:00</p>
             </div>
             <div className="text-right">
               <p className="text-xs text-gray-500 uppercase font-bold mb-1">Code</p>
               <p className="font-black text-gray-900">KJ-8492</p>
             </div>
          </div>
          <button className="w-full bg-gray-900 text-white font-bold py-2 rounded-lg text-sm">
             Verify Pickup
          </button>
        </div>

      </main>

      {/* Merchant Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white border-t border-gray-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          <Link href="/merchant" className="flex flex-col items-center text-green-600">
            <Home size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium mt-1">Dashboard</span>
          </Link>
          <Link href="/merchant/orders" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
            <Package size={24} strokeWidth={2} />
            <span className="text-[10px] font-medium mt-1">Orders</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
