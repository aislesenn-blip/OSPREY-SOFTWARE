"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/Button'
import { useLanguage } from '@/lib/i18n'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const { language, setLanguage, t } = useLanguage()
  const router = useRouter()

  const handleRoleSelection = (role: 'customer' | 'merchant') => {
    if (role === 'customer') {
      router.push('/home')
    } else {
      router.push('/merchant')
    }
  }

  if (step === 1) {
    return (
      <div className="flex-1 flex flex-col justify-center px-6 pb-20 bg-brand-orange text-white">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">KIJIKO</h1>
          <p className="text-xl font-medium opacity-90">Save Food, Save Money.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 text-brand-dark shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Choose your language<br/><span className="text-lg opacity-70">Chagua lugha yako</span></h2>

          <div className="space-y-4">
            <button
              onClick={() => { setLanguage('en'); setStep(2) }}
              className="w-full py-4 border-2 border-brand-gray rounded-xl font-bold text-lg hover:border-brand-orange hover:bg-orange-50 transition-colors"
            >
              English
            </button>
            <button
              onClick={() => { setLanguage('sw'); setStep(2) }}
              className="w-full py-4 border-2 border-brand-gray rounded-xl font-bold text-lg hover:border-brand-orange hover:bg-orange-50 transition-colors"
            >
              Kiswahili
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-12 pb-8 bg-brand-light">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-full aspect-square relative mb-8 max-w-[280px]">
          <Image
            src="https://images.unsplash.com/photo-1594212720448-b4c48f8b8943?auto=format&fit=crop&q=80&w=800"
            alt="Delicious food"
            fill
            className="object-cover rounded-full shadow-2xl border-4 border-white"
            priority
          />
        </div>

        <h1 className="text-3xl font-extrabold text-brand-dark mb-4 leading-tight">
          {t('onboarding.title')}
        </h1>
        <p className="text-lg text-brand-muted mb-12 max-w-[280px]">
          {t('onboarding.subtitle')}
        </p>

        <div className="w-full space-y-4">
          <Button fullWidth size="lg" onClick={() => handleRoleSelection('customer')}>
            {t('onboarding.btn.customer')}
          </Button>
          <Button fullWidth size="lg" variant="outline" onClick={() => handleRoleSelection('merchant')}>
            {t('onboarding.btn.merchant')}
          </Button>
        </div>
      </div>
    </div>
  )
}
