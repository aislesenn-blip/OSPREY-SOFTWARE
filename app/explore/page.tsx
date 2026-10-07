'use client';

import { Search, MapPin } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useLanguage } from '@/lib/LanguageContext';

const CATEGORIES = [
  'Local Food', 'Breakfast', 'Lunch', 'Dinner',
  'Snacks', 'Bakery', 'Drinks', 'Fast Food', 'Vegetarian'
];

export default function Explore() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-10">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
            placeholder={t('explore') + "..."}
          />
        </div>

        <button onClick={() => window.location.href='/explore/map'} className="w-full bg-green-50 text-green-700 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 border border-green-100">
          <MapPin size={18} />
          <span>View Map</span>
        </button>
      </header>

      <main className="flex-1 p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Categories</h2>

        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((category) => (
            <div
              key={category}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center text-center font-medium text-gray-700 active:bg-gray-50"
            >
              {category}
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
