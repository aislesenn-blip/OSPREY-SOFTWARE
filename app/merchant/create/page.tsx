'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function CreateListing() {
  const router = useRouter();
  const { t } = useLanguage();

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/merchant');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{t('createListing')}</h1>
      </header>

      <main className="flex-1 p-4 pb-24">
        <form onSubmit={handlePost} className="space-y-6">

          {/* Photo */}
          <div className="w-full h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
             <Camera size={24} className="mb-2" />
             <span className="text-sm font-medium">Add Food Photo</span>
          </div>

          <div className="space-y-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t('whatSelling')}</label>
              <input type="text" placeholder="e.g. Chicken & Chips" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-medium" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t('howMany')}</label>
              <input type="number" placeholder="e.g. 5" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-medium" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Exact Items Included (Important)</label>
              <textarea placeholder="e.g. 1 piece chicken, 1 portion chips, kachumbari" rows={2} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-medium" required />
              <p className="text-xs text-gray-500 mt-1">Customers must know exactly what they will receive.</p>
            </div>
          </div>

          <div className="space-y-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Original Price (TZS)</label>
                <input type="number" placeholder="8000" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-medium" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-green-700 mb-1">Kijiko Price (TZS)</label>
                <input type="number" placeholder="4000" className="w-full p-3 bg-green-50 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-green-700 placeholder-green-300" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Pickup Time</label>
              <div className="flex items-center space-x-2">
                 <input type="time" className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-medium" required />
                 <span className="text-gray-500 font-bold">to</span>
                 <input type="time" className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-medium" required />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-[0.98] text-lg">
            {t('postListing')}
          </button>
        </form>
      </main>
    </div>
  );
}
