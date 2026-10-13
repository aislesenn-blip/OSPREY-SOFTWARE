"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'sw'

type Translations = {
  [key: string]: {
    en: string
    sw: string
  }
}

const translations: Translations = {
  "onboarding.title": {
    en: "Campus food, sorted.",
    sw: "Chakula cha chuo, kimeshughulikiwa."
  },
  "onboarding.subtitle": {
    en: "Fresh, filling meals ready for you on campus. Subscribe and save.",
    sw: "Chakula kipya na kishibisho tayari kwa ajili yako chuoni. Jiunge na uokoe."
  },
  "onboarding.btn.start": {
    en: "Get Started",
    sw: "Anza Sasa"
  },
  "home.title": {
    en: "Available Meals",
    sw: "Chakula Kilichopo"
  },
  "nav.home": {
    en: "Meals",
    sw: "Chakula"
  },
  "nav.packages": {
    en: "Packages",
    sw: "Vifurushi"
  },
  "nav.orders": {
    en: "Pickups",
    sw: "Vyakuchukua"
  },
  "nav.profile": {
    en: "Profile",
    sw: "Profaili"
  },
  "food.available": {
    en: "available",
    sw: "vipo"
  },
  "food.pickup": {
    en: "Campus Pickup",
    sw: "Kuchukua Chuoni"
  },
  "food.what_you_get": {
    en: "What you're getting",
    sw: "Utakachopata"
  },
  "food.select": {
    en: "Select Meal",
    sw: "Chagua Chakula"
  },
  "checkout.title": {
    en: "Redeem Meal",
    sw: "Chukua Chakula"
  },
  "checkout.location": {
    en: "Pickup Point",
    sw: "Sehemu ya Kuchukulia"
  },
  "checkout.time": {
    en: "Pickup Time",
    sw: "Muda wa Kuchukua"
  },
  "checkout.confirm_btn": {
    en: "Confirm Order",
    sw: "Thibitisha Oda"
  },
  "order.success": {
    en: "Meal Confirmed!",
    sw: "Chakula Kimethibitishwa!"
  },
  "order.pickup_code": {
    en: "Pickup Code",
    sw: "Namba ya Kuchukulia"
  },
  "packages.title": {
    en: "Meal Packages",
    sw: "Vifurushi Vya Chakula"
  },
  "packages.subtitle": {
    en: "Buy in advance, save money, and never worry about your next meal.",
    sw: "Nunua mapema, okoa pesa, na usijali tena kuhusu mlo wako ujao."
  },
  "packages.buy": {
    en: "Buy Package",
    sw: "Nunua Kifurushi"
  },
  "packages.meals": {
    en: "meals",
    sw: "mlo"
  },
  "profile.balance": {
    en: "Meal Balance",
    sw: "Salio la Mlo"
  }
}

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('whemsy-lang') as Language
    if (saved && (saved === 'en' || saved === 'sw')) {
      setLanguage(saved)
    }
    setMounted(true)
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('whemsy-lang', lang)
  }

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation missing for key: ${key}`)
      return key
    }
    return translations[key][language]
  }

  if (!mounted) {
    return null // or a loading skeleton
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
