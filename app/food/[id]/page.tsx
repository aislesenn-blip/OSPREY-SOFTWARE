'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Info } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

// Mock data fetcher
const getFoodItem = (id: string) => {
  return {
    id,
    foodName: '1 Chicken Biryani Box',
    businessName: 'Mambo Restaurant',
    contents: ['Chicken biryani', '1 chicken piece', 'Kachumbari'],
    originalPrice: 10000,
    kijikoPrice: 5000,
    quantityAvailable: 3,
    pickupTimeStart: '19:00',
    pickupTimeEnd: '19:30',
    distanceKm: 1.2,
    address: 'Bibi Titi Road, Dar es Salaam',
  };
};

export default function FoodDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t } = useLanguage();

  const item = getFoodItem(params.id);
  const savings = item.originalPrice - item.kijikoPrice;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header Image Area */}
      <div className="relative h-64 bg-gray-300">
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm z-10"
        >
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
          [High Quality Photo of {item.foodName}]
        </div>
      </div>

      <div className="px-5 pt-6 pb-4 bg-white rounded-t-3xl -mt-6 relative shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">

        {/* Title and Business */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">{item.foodName}</h1>
          <p className="text-base text-gray-600 font-medium">{item.businessName}</p>
        </div>

        {/* What You're Getting - CRITICAL REQUIREMENT */}
        <div className="bg-green-50/50 rounded-xl p-4 mb-6 border border-green-100">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center">
            <Info size={16} className="mr-2 text-green-600" />
            {t('whatYouAreGetting')}
          </h2>
          <ul className="space-y-2">
            {item.contents.map((content, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-green-600 mr-2 mt-0.5">•</span>
                <span className="text-gray-700 font-medium">{content}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing Area */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 shadow-sm flex flex-col space-y-2">
          <div className="flex justify-between items-center text-gray-500">
            <span>{t('originalPrice')}</span>
            <span className="line-through">TZS {item.originalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-lg">
            <span className="text-gray-900">{t('kijikoPrice')}</span>
            <span className="text-green-700">TZS {item.kijikoPrice.toLocaleString()}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-50 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">{t('youSave')}</span>
            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">TZS {savings.toLocaleString()}</span>
          </div>
        </div>

        {/* Logistics */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start">
            <Clock className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-0.5">{t('pickup')}</p>
              <p className="text-gray-900 font-medium">Today, {item.pickupTimeStart} – {item.pickupTimeEnd}</p>
            </div>
          </div>

          <div className="flex items-start">
            <MapPin className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-0.5">{t('location')}</p>
              <p className="text-gray-900 font-medium">{item.businessName}</p>
              <p className="text-gray-500 text-sm mt-0.5">{item.address}</p>
              <button className="text-green-600 text-sm font-bold mt-1 hover:underline">View on map</button>
            </div>
          </div>
        </div>

      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-sm font-bold text-gray-700">{t('quantity')}:</span>
          <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-700">{item.quantityAvailable} {t('available')}</span>
        </div>
        <button
          onClick={() => router.push(`/checkout/${item.id}`)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-colors text-lg"
        >
          {t('reserveFor')} TZS {item.kijikoPrice.toLocaleString()}
        </button>
      </div>

    </div>
  );
}
