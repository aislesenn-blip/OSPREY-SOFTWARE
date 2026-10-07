'use client';

import { useLanguage } from '@/lib/LanguageContext';
import BottomNav from '@/components/BottomNav';
import FoodCard, { FoodItemProps } from '@/components/FoodCard';

// Dummy data
const MOCK_FOOD_ITEMS: FoodItemProps[] = [
  {
    id: '1',
    foodName: 'Chicken & Chips',
    businessName: 'Mambo Restaurant',
    originalPrice: 8000,
    kijikoPrice: 4000,
    quantityAvailable: 2,
    pickupTimeStart: '18:30',
    pickupTimeEnd: '19:00',
    distanceKm: 1.2,
  },
  {
    id: '2',
    foodName: '3 Chapati + Beans',
    businessName: 'Mama Ntilie Makumbusho',
    originalPrice: 4000,
    kijikoPrice: 2000,
    quantityAvailable: 5,
    pickupTimeStart: '13:00',
    pickupTimeEnd: '14:00',
    distanceKm: 0.5,
  },
  {
    id: '3',
    foodName: 'Chicken Biryani Box',
    businessName: 'Zanzibar Spice House',
    originalPrice: 10000,
    kijikoPrice: 5000,
    quantityAvailable: 3,
    pickupTimeStart: '19:00',
    pickupTimeEnd: '19:30',
    distanceKm: 2.1,
  },
  {
    id: '4',
    foodName: '5 Samosas (Beef)',
    businessName: 'Kariakoo Bakery',
    originalPrice: 2500,
    kijikoPrice: 1000,
    quantityAvailable: 10,
    pickupTimeStart: '17:00',
    pickupTimeEnd: '18:00',
    distanceKm: 3.0,
  }
];

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold text-green-700">KIJIKO</h1>
        <p className="text-gray-600 mt-1">{t('whatCanIGet')}</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-gray-900">{t('availableNow')}</h2>
        </div>

        <div className="space-y-4">
          {MOCK_FOOD_ITEMS.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </main>

      {/* Navigation */}
      <BottomNav />
    </div>
  );
}
