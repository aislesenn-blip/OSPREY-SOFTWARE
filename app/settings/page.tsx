'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';

export default function Settings() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Settings</h1>
      </header>

      <main className="flex-1 p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Language Preferences</h2>
          <LanguageSwitcher />
        </div>
      </main>
    </div>
  );
}