'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { useLanguage } from '@/lib/LanguageContext';

export default function Orders() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const mockOrders = [
    {
      id: '1',
      foodName: '1 Chicken Biryani Box',
      businessName: 'Mambo Restaurant',
      price: 5000,
      pickupTimeStart: '19:00',
      pickupTimeEnd: '19:30',
      status: 'upcoming',
      code: 'KJ-8492'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-4 pt-12 pb-2 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-4">{t('orders')}</h1>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200">
          {['upcoming', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-1 text-sm font-bold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-4">
        {activeTab === 'upcoming' && mockOrders.length > 0 ? (
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{order.foodName}</h3>
                    <p className="text-sm text-gray-500">{order.businessName}</p>
                  </div>
                  <span className="font-bold text-green-700">TZS {order.price.toLocaleString()}</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pickup Time</p>
                  <p className="text-sm font-medium">Today, {order.pickupTimeStart} - {order.pickupTimeEnd}</p>
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-500 uppercase font-bold">Pickup Code</span>
                  <span className="font-black text-gray-900 tracking-wider">{order.code}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p>No {activeTab} orders.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
