'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'sw';

interface Translations {
  [key: string]: {
    en: string;
    sw: string;
  };
}

const translations: Translations = {
  // Onboarding
  chooseLanguage: { en: 'Choose Language', sw: 'Chagua Lugha' },
  welcome: { en: 'Welcome to Kijiko', sw: 'Karibu Kijiko' },
  onboardingDesc1: { en: 'Save good food. Save money.', sw: 'Okoa chakula kizuri. Okoa pesa.' },
  onboardingDesc2: { en: 'Get fresh, delicious food from local restaurants before it goes to waste.', sw: 'Pata chakula kipya, kitamu kutoka mikahawa ya karibu kabla hakijaharibika.' },
  getStarted: { en: 'Get Started', sw: 'Anza Sasa' },

  // Home / Discovery
  whatCanIGet: { en: 'What food can I get near me right now?', sw: 'Naweza kupata chakula gani karibu yangu sasa hivi?' },
  availableNow: { en: 'Available Now', sw: 'Kinapatikana Sasa' },
  pickup: { en: 'Pickup', sw: 'Kuchukua' },
  away: { en: 'away', sw: 'umbali' },
  getThis: { en: 'Get This', sw: 'Pata Hiki' },

  // Food Detail
  whatYouAreGetting: { en: "What you're getting", sw: 'Kile unachopata' },
  originalPrice: { en: 'Original price', sw: 'Bei ya awali' },
  kijikoPrice: { en: 'Kijiko price', sw: 'Bei ya Kijiko' },
  youSave: { en: 'You save', sw: 'Unaokoa' },
  location: { en: 'Location', sw: 'Eneo' },
  quantity: { en: 'Quantity', sw: 'Idadi' },
  available: { en: 'available', sw: 'zilizopo' },
  reserveFor: { en: 'Reserve for', sw: 'Hifadhi kwa' },

  // Navigation
  home: { en: 'Home', sw: 'Nyumbani' },
  explore: { en: 'Explore', sw: 'Gundua' },
  orders: { en: 'Orders', sw: 'Oda Zangu' },
  profile: { en: 'Profile', sw: 'Wasifu' },

  // Merchant
  merchantDashboard: { en: 'Merchant Dashboard', sw: 'Dashibodi ya Mfanyabiashara' },
  createListing: { en: 'Create Listing', sw: 'Tengeneza Orodha' },
  whatSelling: { en: 'What are you selling?', sw: 'Unauza nini?' },
  howMany: { en: 'How many?', sw: 'Ngapi?' },
  postListing: { en: 'Post Listing', sw: 'Weka Orodha' },

  // General
  cancel: { en: 'Cancel', sw: 'Ghairi' },
  confirm: { en: 'Confirm', sw: 'Thibitisha' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only access localStorage on client side
    const savedLang = localStorage.getItem('kijiko-lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'sw')) {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kijiko-lang', lang);
  };

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
