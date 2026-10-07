'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export interface FoodItemProps {
  id: string;
  foodName: string;
  businessName: string;
  originalPrice: number;
  kijikoPrice: number;
  quantityAvailable: number;
  pickupTimeStart: string;
  pickupTimeEnd: string;
  distanceKm: number;
  imageUrl?: string; // Optional for this exercise
}

export default function FoodCard({ item }: { item: FoodItemProps }) {
  const { t } = useLanguage();

  return (
    <Link href={`/food/${item.id}`} className="block mb-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        {/* Image Placeholder */}
        <div className="h-40 bg-gray-200 w-full relative">
           <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
             <span className="text-xs font-bold text-gray-800">{item.quantityAvailable} {t('available')}</span>
           </div>
           {/* If we had images we would use next/image here */}
           <div className="w-full h-full flex items-center justify-center text-gray-400">
             [Food Image: {item.foodName}]
           </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.foodName}</h3>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
              {item.distanceKm} km
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3">{item.businessName}</p>

          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl font-bold text-green-700">TZS {item.kijikoPrice.toLocaleString()}</span>
            <span className="text-sm text-gray-400 line-through">TZS {item.originalPrice.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-50">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{t('pickup')}</span>
              <span className="text-sm font-medium text-gray-800">{item.pickupTimeStart} - {item.pickupTimeEnd}</span>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
              {t('getThis')}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
