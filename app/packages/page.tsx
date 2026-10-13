"use client"

import React, { useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { useLanguage } from '@/lib/i18n'
import { mockPackages, formatTZS } from '@/lib/data'
import { Button } from '@/components/Button'

export default function Packages() {
  const { t } = useLanguage()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  return (
    <div className="flex-1 flex flex-col bg-brand-light pb-20 overflow-y-auto scrollbar-hide h-screen">

      {/* Header */}
      <div className="bg-brand-orange px-4 pt-12 pb-16 shadow-sm">
        <h1 className="text-3xl font-extrabold text-white mb-2">{t('packages.title')}</h1>
        <p className="text-white opacity-90">{t('packages.subtitle')}</p>
      </div>

      {/* Packages List */}
      <div className="px-4 -mt-10 space-y-4 flex-1">
        {mockPackages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
            className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer transition-all ${
              selectedPackage === pkg.id ? 'border-brand-orange shadow-md' : 'border-transparent'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-xl text-brand-dark">{pkg.name}</h3>
                <p className="text-sm text-brand-muted">{pkg.description}</p>
              </div>
              <div className="text-right">
                <span className="bg-orange-100 text-brand-orange px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                  {pkg.mealCount} {t('packages.meals')}
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-2xl font-black text-brand-dark">{formatTZS(pkg.price)}</span>
              {selectedPackage === pkg.id && (
                <Button size="sm" onClick={() => alert('Purchase flow would start here.')}>
                  {t('packages.buy')}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
