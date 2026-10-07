'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function MapView() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Map View</h1>
      </header>

      <main className="flex-1 relative bg-gray-200 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          {/* Simulated map background */}
          <div className="w-full h-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CiAgPHBhdGggZD0iTTAgMGwyMCAyME0yMCAwbC0yMCAyMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPg==')]"></div>
        </div>

        <div className="z-10 bg-white p-4 rounded-xl shadow-lg border border-gray-200 text-center max-w-xs relative cursor-pointer" onClick={() => router.push('/food/1')}>
            <MapPin className="text-green-600 mx-auto mb-2" size={32} />
            <p className="font-bold text-gray-900 text-sm">Mambo Restaurant</p>
            <p className="text-xs text-gray-500">Chicken & Chips</p>
            <p className="text-xs font-bold text-green-700 mt-1">TZS 4,000</p>
        </div>
      </main>
    </div>
  );
}
