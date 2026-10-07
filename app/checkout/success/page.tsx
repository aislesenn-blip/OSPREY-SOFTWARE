'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function CheckoutSuccess() {
  const router = useRouter();
  const { t } = useLanguage();

  // Mock verified order
  const order = {
    foodName: '1 Chicken Biryani Box',
    businessName: 'Mambo Restaurant',
    pickupTimeStart: '19:00',
    pickupTimeEnd: '19:30',
    quantity: 1,
    code: 'KJ-8492'
  };

  return (
    <div className="flex flex-col min-h-screen bg-green-50/30">
      <main className="flex-1 p-6 flex flex-col items-center justify-center text-center">

        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">You're all set!</h1>
        <p className="text-gray-600 mb-8 max-w-xs">
          Your food is reserved. Show the pickup code to the merchant when you arrive.
        </p>

        {/* Order Card */}
        <div className="bg-white w-full rounded-2xl p-6 shadow-sm border border-green-100 mb-8 relative overflow-hidden">
          {/* Decorative receipt edges */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxjaXJjbGUgY3g9IjQiIGN5PSI0IiByPSI0IiBmaWxsPSIjZjhmOWZhIi8+PC9zdmc+')] bg-repeat-x -mt-1"></div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">{order.foodName} × {order.quantity}</h2>
          <p className="text-gray-600 font-medium mb-6">{order.businessName}</p>

          <div className="flex flex-col space-y-4 text-left">
            <div className="flex items-start bg-gray-50 p-3 rounded-lg">
              <Clock className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pickup Time</p>
                <p className="text-gray-900 font-bold">Today, {order.pickupTimeStart} – {order.pickupTimeEnd}</p>
              </div>
            </div>

            <div className="flex items-start bg-gray-50 p-3 rounded-lg">
              <MapPin className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Location</p>
                <p className="text-gray-900 font-medium">Bibi Titi Road, Dar es Salaam</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-2">Pickup Code</p>
            <p className="text-4xl font-black text-green-700 tracking-widest">{order.code}</p>
          </div>
        </div>

      </main>

      <div className="p-6 bg-transparent flex-shrink-0">
        <button
          onClick={() => router.push('/orders')}
          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg"
        >
          View My Orders
        </button>
        <button
          onClick={() => router.push('/home')}
          className="w-full mt-3 bg-transparent text-gray-600 font-bold py-4 rounded-xl transition-colors text-base"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
