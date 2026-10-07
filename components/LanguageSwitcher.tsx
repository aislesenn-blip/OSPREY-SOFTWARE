'use client';

import { useLanguage } from '@/lib/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200 w-full max-w-xs mx-auto">
      <button
        onClick={() => setLanguage('en')}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
          language === 'en'
            ? 'bg-white text-green-700 shadow-sm border border-gray-200'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('sw')}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
          language === 'sw'
            ? 'bg-white text-green-700 shadow-sm border border-gray-200'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Kiswahili
      </button>
    </div>
  );
}
