'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Onboarding() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleGetStarted = () => {
    localStorage.setItem('kijiko-onboarded', 'true');
    router.push('/home');
  };

  return (
    <div className="flex flex-col h-screen min-h-screen bg-white">
      {/* Top Section - Brand and Language */}
      <div className="pt-16 pb-8 px-6 flex flex-col items-center flex-shrink-0">
        <h1 className="text-4xl font-extrabold text-green-700 tracking-tight mb-8">KIJIKO</h1>

        <div className="w-full max-w-sm mb-4 text-center">
          <p className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wider">{t('chooseLanguage')}</p>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Middle Section - Core Value */}
      <div className="flex-1 px-8 flex flex-col justify-center items-center text-center">
        {/* Placeholder for illustration */}
        <div className="w-64 h-64 bg-green-50 rounded-full mb-10 flex items-center justify-center">
          <span className="text-6xl">🍲</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
          {t('onboardingDesc1')}
        </h2>
        <p className="text-base text-gray-600 max-w-xs mx-auto">
          {t('onboardingDesc2')}
        </p>
      </div>

      {/* Bottom Section - CTA */}
      <div className="p-6 bg-white border-t border-gray-100 pb-10 flex-shrink-0">
        <button
          onClick={handleGetStarted}
          className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-green-200 transition-transform active:scale-[0.98] text-lg"
        >
          {t('getStarted')}
        </button>
      </div>
    </div>
  );
}
