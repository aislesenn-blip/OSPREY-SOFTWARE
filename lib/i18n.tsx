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
    en: "Save good food. Save money.",
    sw: "Okoa chakula kizuri. Okoa pesa."
  },
  "onboarding.subtitle": {
    en: "Get quality food at half price from your favorite spots.",
    sw: "Pata chakula kizuri kwa nusu bei kutoka maeneo unayopenda."
  },
  "onboarding.btn.customer": {
    en: "I'm a Customer",
    sw: "Mimi ni Mteja"
  },
  "onboarding.btn.merchant": {
    en: "I'm a Merchant",
    sw: "Mimi ni Muuzaji"
  },
  "home.title": {
    en: "Nearby Food",
    sw: "Chakula Karibu"
  },
  "home.get_this": {
    en: "Get This",
    sw: "Chukua Hiki"
  },
  "nav.home": {
    en: "Home",
    sw: "Nyumbani"
  },
  "nav.discover": {
    en: "Discover",
    sw: "Gundua"
  },
  "nav.orders": {
    en: "Orders",
    sw: "Oda"
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
    en: "Pickup",
    sw: "Kuchukua"
  },
  "food.you_save": {
    en: "You save",
    sw: "Umeokoa"
  },
  "food.what_you_get": {
    en: "What you're getting",
    sw: "Utakachopata"
  },
  "food.reserve": {
    en: "Reserve for",
    sw: "Weka oda kwa"
  },
  "checkout.title": {
    en: "Checkout",
    sw: "Lipa"
  },
  "checkout.quantity": {
    en: "Quantity",
    sw: "Idadi"
  },
  "checkout.total": {
    en: "Total",
    sw: "Jumla"
  },
  "checkout.pay_with": {
    en: "Pay with",
    sw: "Lipa na"
  },
  "checkout.pay_btn": {
    en: "Pay Now",
    sw: "Lipa Sasa"
  },
  "order.success": {
    en: "You're all set!",
    sw: "Kila kitu kiko sawa!"
  },
  "order.pickup_code": {
    en: "Pickup Code",
    sw: "Namba ya Kuchukulia"
  },
  "merchant.dashboard": {
    en: "Dashboard",
    sw: "Dashibodi"
  },
  "merchant.create": {
    en: "Create Listing",
    sw: "Weka Oda Mpya"
  },
  "merchant.orders": {
    en: "Orders",
    sw: "Oda"
  },
  "merchant.sales_today": {
    en: "Sales Today",
    sw: "Mauzo ya Leo"
  },
  "merchant.revenue_recovered": {
    en: "Revenue Recovered",
    sw: "Mapato Yaliyoungwa"
  },
  "merchant.what_selling": {
    en: "What are you selling?",
    sw: "Unauza nini?"
  },
  "merchant.how_many": {
    en: "How many?",
    sw: "Vingapi?"
  },
  "merchant.original_price": {
    en: "Original price",
    sw: "Bei ya zamani"
  },
  "merchant.kijiko_price": {
    en: "Kijiko price",
    sw: "Bei ya Kijiko"
  },
  "merchant.post_listing": {
    en: "Post Listing",
    sw: "Weka Oda"
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
    const saved = localStorage.getItem('kijiko-lang') as Language
    if (saved && (saved === 'en' || saved === 'sw')) {
      setLanguage(saved)
    }
    setMounted(true)
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('kijiko-lang', lang)
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
